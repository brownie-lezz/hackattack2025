import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MyFloatingTextInput } from "../../components/Inputs";

const ProfileInput = ({ profile, handleProfileSubmit }) => {
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: profile.name || "",
        job_title: profile.job_title || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      }}
      validationSchema={Yup.object({
        name: Yup.string().required("Required"),
        job_title: Yup.string(),
        email: Yup.string(),
        phone: Yup.string(),
        address: Yup.string(),
      })}
      onSubmit={(formData) => {
        handleProfileSubmit(formData);
      }}
    >
      <Form>
        <MyFloatingTextInput
          label="Full Name"
          name="name"
          type="text"
          placeholder=""
          required
        />
        <MyFloatingTextInput
          label="Job Title"
          name="job_title"
          type="text"
          placeholder=""
        />
        <MyFloatingTextInput
          label="Email"
          name="email"
          type="text"
          placeholder=""
        />
        <MyFloatingTextInput
          label="Phone Number"
          name="phone"
          type="text"
          placeholder=""
        />
        <MyFloatingTextInput
          label="Address"
          name="address"
          type="text"
          placeholder="Enter Address"
        />
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </Form>
    </Formik>
  );
};

export default ProfileInput;
