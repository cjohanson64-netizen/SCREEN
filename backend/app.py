from flask import Flask, request, jsonify
from flask_cors import CORS

from analyzer.measure_file import measure_file
from tat_bridge import run_tat_review
from analyzer.prompt_chain_signals import analyze_code_for_prompt_chain
from prompt_chain_bridge import build_prompt_chain_recommendation

import tempfile
import zipfile
from pathlib import Path
from werkzeug.utils import secure_filename

from project_graph.graph_builder import build_project_graph

app = Flask(__name__)
CORS(app)

def is_safe_zip_path(base_dir: Path, target_path: Path) -> bool:
    try:
        target_path.resolve().relative_to(base_dir.resolve())
        return True
    except ValueError:
        return False


def extract_zip_safely(zip_file, extract_dir: Path) -> None:
    with zipfile.ZipFile(zip_file) as archive:
        for member in archive.infolist():
            member_path = extract_dir / member.filename

            if not is_safe_zip_path(extract_dir, member_path):
                raise ValueError(f"Unsafe zip path detected: {member.filename}")

            archive.extract(member, extract_dir)

@app.route("/api/analyze", methods=["POST"])
def analyze_code():
    data = request.get_json(silent=True) or {}

    code = data.get("code", "")
    filename = data.get("filename", "untitled")

    if not code.strip():
        return jsonify({
            "error": "No code provided"
        }), 400

    metrics = measure_file(code)
    tat_review = run_tat_review(metrics)
    prompt_signals = analyze_code_for_prompt_chain(
        filename=filename,
        code=code,
        metrics=metrics,
    )
    prompt_chain = build_prompt_chain_recommendation(prompt_signals)

    return jsonify({
        "filename": filename,
        "metrics": metrics,
        "tatReview": tat_review,
        "promptChainRecommendation": prompt_chain,
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "tat-code-reviewer-backend"
    })
    
@app.route("/api/project/upload", methods=["POST"])
def upload_project():
    if "project" not in request.files:
        return jsonify({"error": "No project file uploaded"}), 400

    project_file = request.files["project"]

    if not project_file.filename:
        return jsonify({"error": "Uploaded project file has no filename"}), 400

    filename = secure_filename(project_file.filename)

    if not filename.endswith(".zip"):
        return jsonify({"error": "Project upload must be a .zip file"}), 400

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            zip_path = temp_path / filename

            project_file.save(zip_path)

            extract_dir = temp_path / "project"
            extract_dir.mkdir(parents=True, exist_ok=True)

            extract_zip_safely(zip_path, extract_dir)

            graph = build_project_graph(str(extract_dir))

            return jsonify({
                "graph": graph
            })

    except zipfile.BadZipFile:
        return jsonify({"error": "Uploaded file is not a valid zip archive"}), 400

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception as error:
        return jsonify({
            "error": "Failed to process project upload",
            "details": str(error),
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5050)