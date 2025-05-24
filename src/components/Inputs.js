import { useField } from "formik";

const MyTextInput = ({ label, required, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input>. We can use field meta to show an error
  // message if the field is invalid and it has been touched (i.e. visited)
  const [field, meta] = useField(props);
  return (
    <div className="form-group mb-3">
      {meta.touched && meta.error ? (
        <>
          <label htmlFor={props.id || props.name} className="form-label">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
          <input className="form-control is-invalid" {...field} {...props} />
          <div className="invalid-feedback">{meta.error}</div>
        </>
      ) : (
        <>
          <label htmlFor={props.id || props.name} className="form-label">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
          <input className="form-control" {...field} {...props} />
        </>
      )}
    </div>
  );
};

const MyTextArea = ({ label, required, ...props }) => {
  const [field] = useField(props);
  return (
    <div className="form-group mb-3">
      <label htmlFor={props.id || props.name} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <textarea
        className="form-control"
        style={{ height: "200px" }}
        {...field}
        {...props}
      />
    </div>
  );
};

const MySelect = ({ label, required, options, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-group mb-3">
      <label htmlFor={props.id || props.name} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <select className="form-control" {...field} {...props}>
        <option value="" className="text-secondary">
          Select a {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>{" "}
      {meta.touched && meta.error ? (
        <div className="text-danger small">{meta.error}</div>
      ) : null}
    </div>
  );
};

const MyFloatingTextInput = ({ label, required, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-floating mb-3">
      {meta.touched && meta.error ? (
        // Check if there is error display red input outline with message using (is-invalid and invalid-feedback)
        <>
          <input className="form-control is-invalid" {...field} {...props} />
          <label htmlFor={props.id || props.name}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
          <div className="invalid-feedback">{meta.error}</div>
        </>
      ) : (
        // If there is no error display normal input fields
        <>
          <input className="form-control" {...field} {...props} />
          <label htmlFor={props.id || props.name}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        </>
      )}
    </div>
  );
};

const MyFloatingTextArea = ({ label, required, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-floating mb-3">
      <textarea
        className="form-control"
        style={{ height: "100px" }}
        {...field}
        {...props}
      />
      <label htmlFor={props.id || props.name}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {meta.touched && meta.error ? (
        <div className="error text-danger small">{meta.error}</div>
      ) : null}
    </div>
  );
};

export {
  MyTextInput,
  MyTextArea,
  MySelect,
  MyFloatingTextInput,
  MyFloatingTextArea,
};
