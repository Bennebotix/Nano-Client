class PathObject {
  pathArray;
  home;

  #processPath(p) {
    // Process a path input
    if (typeof p == "string") {
      return p.replace("\\", "/").split("/");
    } else if (Array.isArray(p)) {
      return p;
    } else {
      throw new TypeError("Expected string or array for path");
    }
  }

  applyRelative(relative) {
    var rel = this.#processPath(relative);

    // Check absolute
    if (typeof relative == "string" && relative.startsWith("/")) {
      this.pathArray = rel;
      // console.log(this.pathArray);

      // Check home
    } else if (rel.length > 0 && rel[0] == "~") {
      rel.shift();
      this.pathArray = this.home.concat(rel);

    } else {


      if (rel.length > 0 && rel[0] == ".") {
        rel.shift();
      }
      // join
      this.pathArray = this.pathArray.concat(rel);
    }

    // process
    for (var i = 0; i < this.pathArray.length; i++) {
      let pathPart = this.pathArray[i];

      if (pathPart == "") {
        this.pathArray.splice(i, 1); // Delete empty
      } else if (pathPart == "..") {
        if (i > 0) {
          this.pathArray.splice(i - 1, 2) // Delete and before
        } else {
          throw new RangeError("Invalid root parent directory path call.");
        }

      }
    }
  }

  constructor(path, root = "/", home = "") {
    // Path: string, array; Root: for relative only

    if (home === "") {
      this.home = this.#processPath(root);
    } else {
      this.home = this.#processPath(home);
    }

    let pPath = this.#processPath(path);

    if (pPath.length > 0 && typeof path == "string" && path.startsWith("/")) {
      this.pathArray = pPath;
      this.applyRelative(".");
    } else {
      this.pathArray = this.#processPath(root);
      this.applyRelative(pPath); // Apply relative from root
      // console.log("rel")
    }
  }

  toString() {
    return "/" + this.pathArray.join("/");
  }

  parentDir() {
    var parent = new PathObject(this.pathArray.slice(0, -1));
    parent.applyRelative("."); // Refigure
    return parent;
  }

  name() {
    return this.at(-1);
  }

  fileSection() {
    let n = this.name().split(".")
    return {
      parent: this.parentDir(),
      filename: n.slice(0, -1).join("."),
      ext: n.at(-1)
    }
  }

  at(i) {
    return this.pathArray.at(i);
  }
}
