export default {
  en: {
    validationErrors: {
      invalidInput: (fieldName) => `Invalid ${fieldName}`,
      invalidEmailLetters: "Please enter an email with all lower case letters",
      passwordsNotEqual: "Passwords not equal",
    },
  },
  ar: {
    validationErrors: {
      invalidEmailLetters:
        "رجاءًا ادخل بريدك الالكتروني بحروف صغيرة (lower case)",
      passwordsNotEqual: "كلمات السر غير متطابقة",
    },
  },
};
