import React from 'react';
import Button from './Button';

const styles = theme => ({
  buttons: {
    flex: "0 1 auto",
    margin: "auto"
  }
});

class PageButton extends React.Component {
  handleClick = () => {
    this.props.updatePage(this.props.value);
  }
  render() {
    const { value, label, updatePage, ...others } = this.props;
    return <Button {...others} onClick={this.handleClick}>{label || value}</Button>;
  }
}

class Paginate extends React.Component {
  render() {        
    const { classes, count, onChangePage, onChangeRowsPerPage, page, rowsPerPage, ...props } = this.props;
    const pages = Math.ceil(count/ rowsPerPage);
    let page_buttons = [(page === 1) ? <Button key={1} color="primary">1</Button> : <PageButton key={1} color="secondary" value={1} updatePage={onChangePage}/>];
    const btns_displayed = 10;
    let start = 2;
    let end = pages - 1;

    if (pages > btns_displayed) {
      let range = Math.ceil((btns_displayed/2) - 2);
      start = page - range;
      end = page + range;
      if (end > pages) {
        start += pages - end;
        end = pages;
      } else if (start < 2) {
        end += 2 - start;
        start = 2;
      }
      if (start > 2) {
        page_buttons.push(<Button key="dummy-1">...</Button>);
      }
    }
    for (let p = start; p <= end; p++) {
      if (p === page) {
        page_buttons.push(<Button key={p} color="primary">{p}</Button>);
      } else {
        page_buttons.push(<PageButton key={p} color="secondary" value={p} updatePage={onChangePage}/>);
      }
    }
    /* add ellipsis if there is a number gap between last button and second to last button*/
    if (end > pages - 1) {
      page_buttons.push(<Button key="dummy-2">...</Button>);
    }
    page_buttons.push((page === pages) ? <Button key="last_page_btn" color="primary">{pages}</Button> : <PageButton key="last_page_btn" color="secondary" value={pages} updatePage={onChangePage}/>);
    /* add prev button if current page is greater than 1 */
    if (page > 1) {
      page_buttons.unshift(<PageButton key="prev_btn" color="primary" label="Prev" value={page - 1} updatePage={onChangePage}/>);
    }
    /* add next button if current page is less than the total number of pages*/
    if (page < pages) {
      page_buttons.push(<PageButton key="next_btn" color="primary" label="Next" value={page + 1} updatePage={onChangePage}/>);
    }
    
    return (
      <td key="paginated-buttons" className={classes.buttons}>
        {page_buttons}
        <select onChange={onChangeRowsPerPage}>
          {[5, 10, 25, 50, 100, "All"].map(value => <option value={(value === "All") ? count : value} selected={value === rowsPerPage}>{value}</option>)}
        </select>
      </td>
    );
  }
}

export default Paginate;