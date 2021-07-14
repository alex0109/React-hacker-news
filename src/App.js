import React from "react";
import "./App.css";
import axios from "axios";

const DEFAULT_QUERY = "Search smth";
const DEFAULT_HPP = '5';

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HPP = 'hitsPerPage=';

const isSearched = (searchTerm) => (item) =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase());

// App class component
class App extends React.Component {
  _isMounted = false;

  constructor() {
    super();

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
    };

    // Bind methods of class(if use arrow funcs instead methods u can skip binds )
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this)
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];

    const updatedHits = [...oldHits, ...hits];
    this.setState({
      results: { ...result, [searchKey]: { hits: updatedHits, page} },
      isLoading: false
    });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
    
    if(this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    
    event.preventDefault(); // Для предотвращения нативного поведения браузера
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    axios(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then((result) => this._isMounted && this.setSearchTopStories(result.data))
      .catch((error) => this._isMounted && this.setState({error}));
  }

  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }    

  // Delete article
  onDismiss = (index) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = (item) => item.objectID !== index;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: { ...results, [searchKey]: {hits: updatedHits, page} },
    });
  };

  // Controlled component
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;

    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    if(error) {
      return <p>Что то произошло не так<br/> {error} </p>
    }

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          />
        </div>
        { error ? <div className="interactions"><p>Something went wrong</p></div> : <Table list={list} onDismiss={this.onDismiss} />}
        <div className="interactions">
         <ButtonWithLoading isLoading={isLoading} onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            Больше историй
         </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

// Search stainless component
class Search extends React.Component {

  componentDidMount() {
    if(this.input) {
      this.input.focus();
    }
  }

  render() {
    const { value, onChange, onSubmit, children } = this.props;
    return(
      <form className="form" onSubmit={onSubmit}>
        <input type="text" value={value} onChange={onChange} ref={(node) => { this.input = node; }}/>
        <button type="submit">{children}</button>
      </form>
    )
  }
} 

// Table stainless component
const Table = ({ list, onDismiss }) => {
  return (
    <div className="table">
      {list.map((item) => (
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

//Loading stainless component
const Loading = () => {
  return <div>Загрузка...</div>
}

//HOC withLoading
const withLoading = (Component) => (props) => {
  props.isLoading ? <Loading /> : <Component {...props} />
}

const ButtonWithLoading = withLoading(Button);

export default App;

export { Button, Search, Table };
