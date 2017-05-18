'use strict';

module.exports = class VirtualNetwork {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.location = obj.location;
        this.subnets = obj.subnets;
        this.resourceGuid = obj.resourceGuid;
    }
}