/*
async function mounted() {}

createApp({
  data() {
    return {
      instructor_name: "",
      instructor_img: "",
      instructor_certificates: [],
      backend_img: "",
      backend_certificates: [],
      errors: [],
      serverError: "",
      editor: ClassicEditor,
      editorData: {},
    };
  },
  methods: {
    submitForm() {
      let validForm = true,
        instructorNameValid = true,
        instructorImgValid = true,
        instructorCertificatesValid = true;

      if (this.instructor_name.trim().length < 5) {
        validForm = false;
        instructorNameValid = false;

        if (this.errors.findIndex((e) => e.name === "instructor_name") === -1) {
          this.errors = [
            ...this.errors,
            {
              name: "instructor_name",
              message:
                "Please make sure that instructor name length greater than 5!",
            },
          ];
        }
      } else {
        instructorNameValid = true;
      }

      if (this.instructor_img.length === 0) {
        validForm = false;
        instructorImgValid = false;
        if (this.errors.findIndex((e) => e.name === "instructor_img") === -1) {
          this.errors = [
            ...this.errors,
            {
              name: "instructor_img",
              message: "You've not selected any image!",
            },
          ];
        }
      } else {
        instructorImgValid = true;
      }

      if (this.instructor_certificates.length === 0) {
        validForm = false;
        instructorCertificatesValid = false;
        if (
          this.errors.findIndex((e) => e.name === "instructor_certificates") ===
          -1
        ) {
          this.errors = [
            ...this.errors,
            {
              name: "instructor_certificates",
              message: "You've not selected any image!",
            },
          ];
        }
      } else {
        instructorCertificatesValid = true;
      }

      if (validForm) {
        const formData = new FormData();
        formData.append(`instructorImg`, this.backend_img);

        this.backend_certificates.forEach((img) => {
          formData.append("instructorCertificates", img);
        });

        formData.append("instructorName", this.instructor_name);

        axios
          .post("/dashboard/about/add-new-instructor", formData, {
            headers: {
              accept: "application/json",
              "X-XSRF-TOKEN": this.$refs.csrfToken.value,
            },
          })
          .then((res) => {
            window.location = "/dashboard/about";
          })
          .catch((err) => {
            this.serverError = err.message;
          });
      }

      // remove errors
      if (
        instructorNameValid &&
        instructorImgValid &&
        instructorCertificatesValid
      )
        validForm = true;

      if (instructorNameValid) {
        this.errors = this.errors.filter((e) => e.name !== "instructor_name");
      }
      if (instructorImgValid) {
        this.errors = this.errors.filter((e) => e.name !== "instructor_img");
      }
      if (instructorCertificatesValid) {
        this.errors = this.errors.filter(
          (e) => e.name !== "instructor_certificates"
        );
      }
    },
    addInstructorImg(e) {
      let validImage = true;
      if (e.target.files[0].size >= 2 * 1024 * 1024) {
        validImage = false;
        if (
          this.errors.findIndex((err) => err.name === "instructor_img") === -1
        ) {
          this.errors = [
            ...this.errors,
            {
              name: "instructor_img",
              message: "Very large image!, please select smaller image",
            },
          ];
        }
      } else {
        this.backend_img = e.target.files[0];
        this.instructor_img = e.target.files[0].name;
        validImage = true;
      }

      if (validImage) {
        this.errors = this.errors.filter((e) => e.name !== "instructor_img");
      }
    },
    addInstructorCertificates(e) {
      let certificatesNames = [];
      for (let i of e.target.files) {
        certificatesNames.push(i.name);
        this.backend_certificates = [...this.backend_certificates, i];
      }
      this.instructor_certificates = certificatesNames;

      if (
        certificatesNames.length > 0 &&
        this.errors.findIndex((err) => err.name === "instructor_certificates")
      ) {
        this.errors = this.errors.filter(
          (e) => e.name !== "instructor_certificates"
        );
      }
    },
  },
  mounted,
})
  .use(CKEditor)
  .mount("#app");
*/
