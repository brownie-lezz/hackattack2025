import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MyFloatingTextInput } from "../../components/Inputs";

const CompanyInput = ({ company, handleCompnaySubmit }) => {
  return (
    <Formik
      initialValues={{
        company_name: company.company_name || "",
        department: company.department || "",
        address: company.address || "",
      }}
      validationSchema={Yup.object({
        company_name: Yup.string(),
        department: Yup.string(),
        address: Yup.string(),
      })}
      onSubmit={(formData) => {
        handleCompnaySubmit(formData);
      }}
    >
      <Form>
        <MyFloatingTextInput
          label="Company Name"
          name="company_name"
          type="text"
          placeholder="Enter Company Name"
        />
        <MyFloatingTextInput
          label="Address"
          name="address"
          type="text"
          placeholder="Enter Company Address"
        />
        <MyFloatingTextInput
          label="Name of recipient/department"
          name="department"
          type="text"
          placeholder="Enter name of recipient/department"
        />
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </Form>
    </Formik>
  );
};

export default CompanyInput;
