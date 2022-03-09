const addingToCart = (e) => {
  // const parentContainer = e.parentElement;
  // const courseId = parentContainer.querySelector("[name='courseId']").value;
  // const csrfToken = parentContainer.querySelector("[name='_csrf']").value;
  // const selected_round = parentContainer.querySelector(
  //   "[name='selected_round']:checked"
  // )?.value;
  // const courseIdStringed = JSON.stringify({
  //   courseId,
  //   selected_round,
  // });
  // const modalButton = document.querySelector(`[data-bs-toggle="modal"]`);
  // const modalBody = document.querySelector(".modal-body");
  // const modalTitle = document.querySelector(".modal-title");
  // const modalCloseButton = document.querySelector(`[data-bs-dismiss='modal']`);
  //
  // if (!selected_round) {
  //   modalTitle.textContent = "Warning!";
  //   modalBody.textContent = "Please choose a round date!";
  //   modalCloseButton.classList.add("btn-danger");
  //   modalButton.click();
  // } else {
  //   fetch(`${window.location.origin}/courses/addToCart`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-csrf-token": csrfToken,
  //     },
  //     body: courseIdStringed,
  //   })
  //     .then(async (result) => {
  //       // console.log(result);
  //       const jsonResult = await result.json();
  //       if (result.status === 422) {
  //         throw new Error(jsonResult.message);
  //       } else {
  //         modalTitle.textContent = "Success";
  //         modalBody.textContent = "";
  //         modalBody.insertAdjacentHTML(
  //           "beforeend",
  //           `Item added successfully to your cart proceed to <a href="/cart">Checkout</a> or <a href="/complete_payment">buy now</a>? or continue <a href="/courses">shopping</a>`
  //         );
  //         modalCloseButton.style.display = "none";
  //         modalButton.click();
  //       }
  //     })
  //     .catch((err) => {
  //       modalTitle.textContent = "Warning!";
  //       modalBody.textContent = "";
  //       modalBody.insertAdjacentHTML("beforeend", err.message);
  //       modalCloseButton.style.display = "none";
  //       modalCloseButton.classList.toggle("btn-danger");
  //       modalButton.click();
  //       console.error(err);
  //     });
  // }
};

// const myModal = document.getElementById("myModal");
// const myInput = document.getElementById("myInput");
//
// myModal.addEventListener("shown.bs.modal", function () {
//   myInput.focus();
// });
