import React, { useState } from "react";

const Pagination = ({ jobsPerPage, totalJobs, paginate }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  let pageNumbers = [];

  if (totalPages <= 5) {
    // if the total number of pages is 5 or less, display all pages
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // otherwise, display the first two pages, the current page, and the last two pages
    const firstPage = Math.max(1, currentPage - 1);
    const lastPage = Math.min(totalPages, currentPage + 1);
    for (let i = firstPage; i <= lastPage; i++) {
      pageNumbers.push(i);
    }

    // if there are more than 5 pages, add the dot dot icon
    if (lastPage < totalPages - 1) {
      pageNumbers.push("...");
    }
    if (lastPage < totalPages) {
      pageNumbers.push(totalPages);
    }
    if (firstPage > 2) {
      pageNumbers.unshift("...");
    }
    if (firstPage > 1) {
      pageNumbers.unshift(1);
    }
  }

  const beforePaginate = (pageNumber) => {
    if (pageNumber === 0) {
      setCurrentPage(1);
      paginate(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
      paginate(totalPages);
    } else {
      setCurrentPage(pageNumber);
      paginate(pageNumber);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          <li className={"page-item" + (currentPage === 1 ? " disabled" : "")}>
            <button
              className="page-link"
              aria-label="Previous"
              onClick={() => beforePaginate(currentPage - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          {pageNumbers.map((number, index) => (
            <li
              key={index}
              className={
                "page-item" +
                (currentPage === number ? " active" : "") +
                (number === "..." ? " disabled" : "")
              }
            >
              <button className="page-link" onClick={() => beforePaginate(number)}>
                {number}
              </button>
            </li>
          ))}
          <li
            className={
              "page-item" + (currentPage === totalPages ? " disabled" : "")
            }
          >
            <button
              className="page-link"
              aria-label="Next"
              onClick={() => beforePaginate(currentPage + 1)}
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
