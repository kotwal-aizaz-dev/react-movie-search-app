/* eslint-disable react/prop-types */
const Search = ({ searchText, onSearch }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />
        <input
          type="text"
          name=""
          id=""
          placeholder="Search through thousands of movies"
          value={searchText}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
    </div>
  );
}

export default Search;
