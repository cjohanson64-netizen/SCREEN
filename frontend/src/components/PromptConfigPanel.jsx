import {
  TASK_OPTIONS,
  TARGET_ARCHITECTURES,
  STRICTNESS_OPTIONS,
  OUTPUT_FORMATS,
  DOMAIN_OPTIONS,
} from "../constants/promptOptions";

function SelectField({ label, value, options, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PromptConfigPanel({ config, onChange }) {
  function update(key, value) {
    onChange({
      ...config,
      [key]: value,
    });
  }

  return (
    <section className="panel">
      <h3>Prompt Configuration</h3>

      <div className="prompt-config-grid">
        <SelectField
          label="Task"
          value={config.task}
          options={TASK_OPTIONS}
          onChange={(value) => update("task", value)}
        />

        <SelectField
          label="Target Architecture"
          value={config.targetArchitecture}
          options={TARGET_ARCHITECTURES}
          onChange={(value) => update("targetArchitecture", value)}
        />

        <SelectField
          label="Strictness"
          value={config.strictness}
          options={STRICTNESS_OPTIONS}
          onChange={(value) => update("strictness", value)}
        />

        <SelectField
          label="Output Format"
          value={config.outputFormat}
          options={OUTPUT_FORMATS}
          onChange={(value) => update("outputFormat", value)}
        />

        <SelectField
          label="Domain"
          value={config.domain}
          options={DOMAIN_OPTIONS}
          onChange={(value) => update("domain", value)}
        />
      </div>
    </section>
  );
}