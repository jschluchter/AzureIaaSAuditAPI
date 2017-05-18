module.exports = function(name, access, protocol, destaddress, destport,
    sourceaddress, sourceport, priority, direction) {
    this.RuleName = name;
    this.Access = access;
    this.Protocol = protocol;
    this.DestAddress = destaddress;
    this.DestPort = destport;
    this.SourceAddress = sourceaddress;
    this.SourcePort = sourceport;
    this.Priority = priority;
    this.Direction = direction;
}