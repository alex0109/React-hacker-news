import React from 'react';

const Table = (props) => {
    return (
        <div className="table">
            {users.filter(isSearched(searchTerm)).map(item => {

                const onHandleDismiss = () => {
                    this.onDismiss(item.id);
                }

                return (
                    <div className="container">
                        <p>Name: {item.name}</p>
                        <p>ID: {item.id}</p>
                        <p>Hobbie: {item.hobbies}</p>
                        <button onClick={onHandleDismiss}>Delete user</button>
                    </div>
                )
            })}
        </div>
    );
}

export default Table;