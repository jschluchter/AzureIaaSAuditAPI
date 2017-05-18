module.exports = function(name, cidr, nsg) {
    this.SubnetName = name;
    this.CIDR = cidr;
    this.NSGName = nsg;
    this.NSGRules = [];
}