module.exports = function(id, name, region) {
    this.VNetID = id;
    this.VNetName = name;
    this.Location = region;
    this.CIDRs = [];
    this.Subnets = [];
}