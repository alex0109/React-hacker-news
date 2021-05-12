import React from 'react';

const Search = (props) => {
    return (
        <div className="form">
            <form>
                <p>Search :</p>
                <input type="text" onChange={props.onSearchChange} value={props.searchTerm} />
            </form>
        </div>
    );
}

export default Search;