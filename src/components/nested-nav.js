import React from 'react';
import { Link } from "gatsby-theme-material-ui";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& a:hover': {
      textDecoration: 'none',
    },
    '& li:hover': { color: theme.palette.warning.main },
  },
  nested: {
    paddingLeft: theme.spacing(2),
  },
  selected: {
    color: theme.palette.primary.light,
  },
  unselected: {
    color: theme.palette.text.primary,
  },
}));

function NavListItem({ title, pathname, currentPathname, handleNav }) {
  const classes = useStyles();
  const selected = pathname === currentPathname;
  const textClass = selected ? classes.selected : classes.unselected;
  const handler = (e) => {
    if (typeof handleNav === 'function') handleNav(e)
  };
  return (
    <Link to={pathname} className={textClass} onClick={handler}>
      <ListItem>
        <ListItemText primary={title}/>
      </ListItem>
    </Link>
  );          
}

function NestedNavListItem({ title, children, open = false }) {
  const [isOpen, setOpen] = React.useState(open);
  const handleClick = () => {
    setOpen(!isOpen);
  };
  return (
    <>
      <ListItem onClick={handleClick}>
        <ListItemText primary={title}/>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
}

// Ideally these annotations would be added in nav-tree.js, but for now it's
// probably OK because it's only run once at the root component.
const annotateCurrentPath = currentPathname => nav => {
  if (nav.page && currentPathname === nav.page.pathname) {
    return { ...nav, onCurrentPath: true };
  }
  const children = nav.children.map(annotateCurrentPath(currentPathname));
  let onCurrentPath = children.some(child => child.onCurrentPath);
  return {...nav, children, onCurrentPath };
}

export default function NestedNav(props) {
  const classes = useStyles();
  const { nav, currentPathname, root = true, handleNav, ...rest } = props;
  if (!nav) return null;
  const { key, title, page, children, onCurrentPath = false } = nav;
  let listItems = null;

  if (root) {
    const annotateChild = annotateCurrentPath(currentPathname);
    listItems = children.map(child => (
      <NestedNav 
        nav={annotateChild(child)}
        currentPathname={currentPathname}
        root={false}
        key={child.key}
        handleNav={handleNav}/>
    ));
  } else if (children.length === 0 && page) {
    listItems = <NavListItem
      title={page.title}
      pathname={page.pathname}
      currentPathname={currentPathname}
      key={key}
      handleNav={handleNav}/>;
  } else if (children.length > 0) {
    const nested = (page ? [{ ...nav, children: [] }, ...children] : children)
      .map(child => (
        <NestedNav
          nav={child} root={false}
          currentPathname={currentPathname}
          key={child.key}
          className={classes.nested}
          handleNav={handleNav}/>
      ));
    listItems = (
      <NestedNavListItem title={title} open={onCurrentPath} key={key}>
        {nested}
      </NestedNavListItem>
    );
  }
  return (
    <List component='nav' className={classes.root} { ...rest }>
      {listItems}
    </List>
  );
}
