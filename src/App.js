import React from "react";
import "./App.css";

const DEFAULT_QUERY = "redux";

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";

const isSearched = (searchTerm) => (item) =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());

// App class component
class App extends React.Component {
  constructor() {
    super();

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
    };

    // Bind methods of class(if use funcs instead methods u can skip binds )
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  setSearchTopStories(result) {
    this.setState({ result });
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then((response) => response.json())
      .then((result) => this.setSearchTopStories(result))
      .catch((error) => error);
  }

  // Delete article
  onDismiss = (index) => {
    const isNotId = (item) => item.objectID !== index;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({
      result: { ...this.state.result, hits: updatedHits },
    });
  };

  // Controlled component
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const { searchTerm, result } = this.state;

    if (!result) {
      return null;
    }

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange}>
            Search
          </Search>
        </div>
        {result && (
          <Table
            list={result.hits}
            pattern={searchTerm}
            onDismiss={this.onDismiss}
          />
        )}
      </div>
    );
  }
}

// Search stainless component
const Search = ({ value, onChange, children }) => {
  return (
    <form className="form">
      {children}
      <input type="text" value={value} onChange={onChange} />
    </form>
  );
};

// Table stainless component
const Table = ({ list, pattern, onDismiss }) => {
  return (
    <div className="table">
      {list.filter(isSearched(pattern)).map((item) => (
        <div key={item.objectID} className="table-row">
          <span>
            <a href={item.url}>| {item.title} |</a>
          </span>
          <span>| Author {item.author} |</span>
          <span>|Comments {item.num_comments}|</span>
          <span>|Points {item.points}|</span>
          <span>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Отбросить
            </Button>
          </span>
        </div>
      ))}
    </div>
  );
};

// Button stainless component
const Button = ({ onClick, className = "", children }) => {
  return (
    <button onClick={onClick} className={className} type="button">
      {children}
    </button>
  );
};

export default App;
