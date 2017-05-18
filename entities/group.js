'use strict';

module.exports = class ResourceGroup {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.location = obj.location;
    }
}