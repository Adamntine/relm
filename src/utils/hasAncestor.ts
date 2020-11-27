export function hasAncestor(element: Node, ancestor: Node): boolean {
  if (element === null) {
    return false;
  } else if (element === ancestor) {
    return true;
  } else {
    return hasAncestor(element.parentNode, ancestor);
  }
}
