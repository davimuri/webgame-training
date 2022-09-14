export default class Arrays {
  static remove(obj, arr) {
    const index = arr.indexOf(obj);
    if (index != -1) {
      arr.splice(index, 1);
    }
  }

  static addIfAbsent(obj, arr) {
    if (!arr.includes(obj)) {
      arr.push(obj);
    }
  }
}