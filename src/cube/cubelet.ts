import * as THREE from "three";
import { Shape, ShapePath } from "three";

class Frame extends THREE.Geometry {
  private static readonly _INDICES = [
    [1, 6, 7],
    [0, 1, 7],
    [3, 0, 10],
    [11, 3, 10],
    [17, 2, 3],
    [16, 17, 3],
    [23, 20, 1],
    [2, 23, 1],
    [5, 12, 13],
    [4, 5, 13],
    [9, 13, 14],
    [8, 9, 14],
    [22, 15, 12],
    [21, 22, 12],
    [19, 14, 15],
    [18, 19, 15],
    [7, 4, 9],
    [10, 7, 9],
    [11, 8, 19],
    [16, 11, 19],
    [23, 17, 18],
    [22, 23, 18],
    [20, 21, 5],
    [6, 20, 5],
    [20, 6, 1],
    [10, 0, 7],
    [21, 12, 5],
    [13, 9, 4],
    [23, 2, 17],
    [11, 16, 3],
    [22, 18, 15],
    [8, 14, 19]
  ];

  constructor(size: number, border: number) {
    super();
    let _O = size / 2;
    let _I = _O - border;
    let _verts = [
      //0: F Face
      [-_I, +_I, +_O],
      [+_I, +_I, +_O],
      [+_I, -_I, +_O],
      [-_I, -_I, +_O],
      //4: U Face
      [-_I, +_O, -_I],
      [+_I, +_O, -_I],
      [+_I, +_O, +_I],
      [-_I, +_O, +_I],
      //8: L Face
      [-_O, -_I, -_I],
      [-_O, +_I, -_I],
      [-_O, +_I, +_I],
      [-_O, -_I, +_I],
      //12: B Face
      [+_I, +_I, -_O],
      [-_I, +_I, -_O],
      [-_I, -_I, -_O],
      [+_I, -_I, -_O],
      //16: D Face
      [-_I, -_O, +_I],
      [+_I, -_O, +_I],
      [+_I, -_O, -_I],
      [-_I, -_O, -_I],
      //20: R Face
      [+_O, +_I, +_I],
      [+_O, +_I, -_I],
      [+_O, -_I, -_I],
      [+_O, -_I, +_I]
    ];

    for (let i = 0; i < _verts.length; i++) {
      let _vert = _verts[i];
      this.vertices.push(new THREE.Vector3(_vert[0], _vert[1], _vert[2]));
    }
    for (let i = 0; i < Frame._INDICES.length; i++) {
      let _indice = Frame._INDICES[i];
      let _face = new THREE.Face3(_indice[0], _indice[1], _indice[2]);
      this.faces.push(_face);
    }
  }
}

class Sticker extends THREE.ShapeGeometry {
  constructor(size: number, edge: number) {
    size = size / 2;
    size = size - edge;
    let left = -size;
    let bottom = size;
    let top = -size;
    let right = size;
    let radius = size / 4;

    let shape = new Shape();
    shape.moveTo(left, top + radius);
    shape.lineTo(left, bottom - radius);
    shape.quadraticCurveTo(left, bottom, left + radius, bottom);
    shape.lineTo(right - radius, bottom);
    shape.quadraticCurveTo(right, bottom, right, bottom - radius);
    shape.lineTo(right, top + radius);
    shape.quadraticCurveTo(right, top, right - radius, top);
    shape.lineTo(left + radius, top);
    shape.quadraticCurveTo(left, top, left, top + radius);
    shape.closePath();

    super(shape);
  }
}

class Edge extends THREE.ShapeGeometry {
  constructor(size: number, edge: number) {
    let shape = new Shape();
    size = size / 2;
    shape.moveTo(-size, -size);
    shape.lineTo(-size, size);
    shape.lineTo(size, size);
    shape.lineTo(size, -size);
    shape.closePath();

    size = size - edge;
    let left = -size;
    let bottom = size;
    let top = -size;
    let right = size;
    let radius = size / 4;

    let hole = new Shape();
    hole.moveTo(left, top + radius);
    hole.quadraticCurveTo(left, top, left + radius, top);
    hole.lineTo(right - radius, top);
    hole.quadraticCurveTo(right, top, right, top + radius);
    hole.lineTo(right, bottom - radius);
    hole.quadraticCurveTo(right, bottom, right - radius, bottom);
    hole.lineTo(left + radius, bottom);
    hole.quadraticCurveTo(left, bottom, left, bottom - radius);
    hole.lineTo(left, top + radius);
    hole.closePath();

    shape.holes.push(hole);
    super(shape);
  }
}

export default class Cubelet extends THREE.Group {
  private static readonly _SIZE: number = 32;
  private static readonly _BORDER_WIDTH: number = 2;
  private static readonly _EDGE_WIDTH: number = 1;
  private static readonly _FRAME: Frame = new Frame(
    Cubelet._SIZE,
    Cubelet._BORDER_WIDTH
  );
  private static readonly _EDGE: Edge = new Edge(
    Cubelet._SIZE - 2 * Cubelet._BORDER_WIDTH,
    Cubelet._EDGE_WIDTH
  );
  private static readonly _STICKER: Sticker = new Sticker(
    Cubelet._SIZE - 2 * Cubelet._BORDER_WIDTH,
    Cubelet._EDGE_WIDTH
  );
  private static readonly _MATERIALS = {
    p: new THREE.MeshBasicMaterial({ wireframe: false, color: "#000000" }),
    i: new THREE.MeshBasicMaterial({ wireframe: false, color: "#303030" }),
    g: new THREE.MeshBasicMaterial({ wireframe: false, color: "#009D54" }),
    o: new THREE.MeshBasicMaterial({ wireframe: false, color: "#FF6C00" }),
    b: new THREE.MeshBasicMaterial({ wireframe: false, color: "#3D81F6" }),
    y: new THREE.MeshBasicMaterial({ wireframe: false, color: "#FDCC09" }),
    w: new THREE.MeshBasicMaterial({ wireframe: false, color: "#FFFFFF" }),
    r: new THREE.MeshBasicMaterial({ wireframe: false, color: "#DC422F" })
  };
  public initial: number;
  private _index: number;
  private _vector: THREE.Vector3 = new THREE.Vector3();

  set vector(vector) {
    this._vector.set(
      Math.round(vector.x),
      Math.round(vector.y),
      Math.round(vector.z)
    );
    this._index =
      (this.vector.z + 1) * 9 + (this.vector.y + 1) * 3 + (this.vector.x + 1);
    this.position.x = Cubelet._SIZE * this._vector.x;
    this.position.y = Cubelet._SIZE * this._vector.y;
    this.position.z = Cubelet._SIZE * this._vector.z;
  }
  get vector() {
    return this._vector;
  }

  set index(index) {
    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new THREE.Vector3(_x, _y, _z);
  }
  
  get index() {
    return this._index;
  }

  constructor(index: number) {
    super();
    this.initial = index;
    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new THREE.Vector3(_x, _y, _z);

    let materials = [
      this._vector.x < 0 ? Cubelet._MATERIALS.o : Cubelet._MATERIALS.i,
      this._vector.x > 0 ? Cubelet._MATERIALS.r : Cubelet._MATERIALS.i,
      this._vector.y < 0 ? Cubelet._MATERIALS.w : Cubelet._MATERIALS.i,
      this._vector.y > 0 ? Cubelet._MATERIALS.y : Cubelet._MATERIALS.i,
      this._vector.z < 0 ? Cubelet._MATERIALS.g : Cubelet._MATERIALS.i,
      this._vector.z > 0 ? Cubelet._MATERIALS.b : Cubelet._MATERIALS.i
    ];

    let _frame = new THREE.Mesh(Cubelet._FRAME, Cubelet._MATERIALS.p);
    this.add(_frame);

    for (let i = 0; i < 6; i++) {
      let _edge = new THREE.Mesh(Cubelet._EDGE, Cubelet._MATERIALS.p);
      let _sticker = new THREE.Mesh(Cubelet._STICKER, materials[i]);
      switch (i) {
        case 0:
          _edge.rotation.y = -Math.PI / 2;
          _edge.position.x = -Cubelet._SIZE / 2;
          _sticker.rotation.y = -Math.PI / 2;
          _sticker.position.x = -Cubelet._SIZE / 2;
          break;
        case 1:
          _edge.rotation.y = Math.PI / 2;
          _edge.position.x = Cubelet._SIZE / 2;
          _sticker.rotation.y = Math.PI / 2;
          _sticker.position.x = Cubelet._SIZE / 2;
          break;
        case 2:
          _edge.rotation.x = Math.PI / 2;
          _edge.position.y = -Cubelet._SIZE / 2;
          _sticker.rotation.x = Math.PI / 2;
          _sticker.position.y = -Cubelet._SIZE / 2;
          break;
        case 3:
          _edge.rotation.x = -Math.PI / 2;
          _edge.position.y = Cubelet._SIZE / 2;
          _sticker.rotation.x = -Math.PI / 2;
          _sticker.position.y = Cubelet._SIZE / 2;
          break;
        case 4:
          _edge.rotation.x = Math.PI;
          _edge.position.z = -Cubelet._SIZE / 2;
          _sticker.rotation.x = Math.PI;
          _sticker.position.z = -Cubelet._SIZE / 2;
          break;
        case 5:
          _edge.rotation.z = 0;
          _edge.position.z = Cubelet._SIZE / 2;
          _sticker.rotation.z = 0;
          _sticker.position.z = Cubelet._SIZE / 2;
          break;
        default:
          break;
      }
      this.add(_edge);
      this.add(_sticker);
    }
  }
}