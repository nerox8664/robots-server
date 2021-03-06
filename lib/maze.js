'use strict';

var log = require('debug')('maze');

class Dungeon {
  constructor(h, w, rooms, roomSize) {
    this.maze = [];

    this.h = h;
    this.w = w;
    this.rooms = [];
    this.roomSize = roomSize;

    this._lastRoomId = 2;

    this._createEmpty();

    for (var i = 0; i < rooms; i++) {
      var newRoom = this._createRoom();
      if (newRoom) {
        log('>> Created', newRoom);
        this._appendRoom(newRoom);
        this.rooms.push(newRoom);
      }
    }

    log('Total rooms created: ' + this.rooms.length);

    this._connectRooms();
    this._restoreMaze();

    this.setSpawn();
  }

  setSpawn() {
    this.spawn = {};
    this.spawn.room = this.rooms[Math.floor(this.rooms.length * Math.random())];
    this.spawn.x = this.spawn.room.cx;
    this.spawn.y = this.spawn.room.cy;
  }

  // Create spawn points
  spawnObjects(count) {
    if (count >= this.rooms.length - 1) {
      count = this.rooms.length - 1;
    }

    let usedRooms = [this.spawn.room];
    this.objects = [];
    for (let i = 0; i < count; i++) {
      let objectRoom = this.rooms[0];
      while (usedRooms.indexOf(objectRoom) != -1) {
        objectRoom = this.rooms[Math.floor(this.rooms.length * Math.random())];
      }

      let x = objectRoom.cx + Math.ceil(Math.random() * objectRoom.w / 4.0 - objectRoom.w / 4.0);
      let y = objectRoom.cy + Math.ceil(Math.random() * objectRoom.h / 4.0 - objectRoom.h / 4.0);
      this.objects.push([x, y]);
      usedRooms.push(objectRoom);
    }

    return this.objects;
  }

  // Reset maze array
  _restoreMaze() {
    for (var i = 0; i < this.rooms.length; i++) {
      this._appendRoom(this.rooms[i]);
    }
  }

  _connectRooms() {
    var findNearest = (room, except) => {

      var inearest = -1;
      var imin = this.h * this.w;

      for (var i = 0; i < this.rooms.length; i++) {

        if (except.indexOf(this.rooms[i]) !== -1) {
          continue;
        }

        var dist = Math.sqrt((room.cx - this.rooms[i].cx) * (room.cx - this.rooms[i].cx) +
          (room.cy - this.rooms[i].cy) * (room.cy - this.rooms[i].cy));

        if (dist < imin) {
          inearest = i;
          imin = dist;
        }
      }

      return this.rooms[inearest];
    };

    var createLink = (roomA, roomB) => {

      var dx = roomA.cx > roomB.cx ? -1 : 1;
      var dy = roomA.cy > roomB.cy ? -1 : 1;

      for (var x = roomA.cx, y = roomA.cy;;) {
        if (this.maze[y][x] == roomB.id) {
          break;
        }

        if (y != roomB.cy) {
          y += dy;
        } else if (x != roomB.cx) {
          x += dx;
        } else {
          break;
        }

        this.maze[y][x] = 1;
      }
    };

    var except = [];
    for (var i = 0; i < this.rooms.length; i++) {
      except.push(this.rooms[i]);
      var nearest = findNearest(this.rooms[i], except);
      if (nearest) {
        createLink(this.rooms[i], nearest);
      }
    }
  }

  // Create new room without colliding
  _createRoom() {
    var room = {
      id: this._lastRoomId,
      h: Math.floor(Math.random() * this.roomSize / 2.0 + this.roomSize / 2.0),
      w: Math.floor(Math.random() * this.roomSize / 2.0 + this.roomSize / 2.0),
      x: 1,
      y: 1,
      cx: 0,
      cy: 0,
    };

    while (this._isColliding(room)) {
      room.x += Math.floor(Math.random() * 4);
      if (room.x + room.w >= this.w - 1) {
        room.x = 1;
        room.y++;
        if (room.y + room.h >= this.h - 1) {
          return null;
        }
      }
    }

    room.cx = Math.floor(room.x + room.w / 2.0);
    room.cy = Math.floor(room.y + room.h / 2.0);

    this._lastRoomId++;
    return room;
  }

  // Append room to maze
  _appendRoom(room) {
    for (var i = room.y; i < room.y + room.h; i++) {
      for (var j = room.x; j < room.x + room.w; j++) {
        this.maze[i][j] = room.id;
      }
    }
  }

  // Chech if new room is colliding with existance rooms
  _isColliding(room) {
    for (var i = Math.max(0, room.y - 1); i < Math.min(this.h, room.y + room.h + 1); i++) {
      for (var j = Math.max(0, room.x - 1); j < Math.min(this.w, room.x + room.w + 1); j++) {
        if (this.maze[i][j] != 0) {
          return true;
        }
      }
    }

    return false;
  }

  // Create empty array for maze generation
  _createEmpty() {
    for (var i = 0; i < this.h; i++) {
      this.maze[i] = [];
      for (var j = 0; j < this.w; j++) {
        this.maze[i][j] = 0;
      }
    }
  }

};

module.exports = Dungeon;
