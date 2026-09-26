export default function FormGroup({ label, required, hint, children }) {
  return (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      {children}
      {hint && <small className="form-hint">{hint}</small>}
    </div>
  );
}
