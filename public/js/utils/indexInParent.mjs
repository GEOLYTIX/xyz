// Find the index of node in childNodes of parentNode.
export function indexInParent(node) {

  if (!node) return -1;

  let children = node.parentNode.childNodes,
    num = 0;

  for (let i = 0; i < children.length; i++) {
    if (children[i] === node) return num;
    if (children[i].nodeType === 1) num++;
  }

}