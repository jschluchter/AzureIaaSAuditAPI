var rest = require('ms-rest-azure');
var async = require('async');
// const NodeCache = require( "node-cache" );
// const localCache = new NodeCache();

var ResourceGroup = require('./entities/group.js');
var VirtualNetwork = require('./entities/network.js');
// var SubnetEntity = require('./entities/subnetentity.js');
// var NSGRuleEntity = require('./entities/nsgruleentity.js');

var arm = require('azure-arm-resource');
var armnetwork = require('azure-arm-network');

var appid = '|||';
var appkey = '|||';
var tenant = '|||';
var subid = '|||';

var armclient;
var armnetworkclient;
var credentials;
var _tmpGroups;
var _tmpNetworks;
var resourcegroups = [];
var virtualnetworks = [];

function setArmclient(cb) {

    if (!armclient) {
        armclient = new arm.ResourceManagementClient(credentials, subid);
        cb(null);
    } else {
        cb(null);
    }

}

function setArmnetworkclient(cb) {

    if (!armnetworkclient) {
        armnetworkclient = new armnetwork(credentials, subid);
        cb(null);
    } else {
        cb(null);
    }

}

function setCredentials(cb) {

    if (!credentials) {

        rest.loginWithServicePrincipalSecret(appid, appkey, tenant,
            (e, c) => {

                if (!e) {
                    credentials = c;
                    console.log("credentials");
                    cb(null);
                } else {
                    console.log("no credentials");
                    cb(e, null);
                }

            }
        );

    }

}

function getResourcegroups(cb) {

    if (resourcegroups.length < 1) {
        armclient.resourceGroups.list((e, g) => {
            _tmpGroups = g;
            cb(null);
        });
    } else {
        cb(null);
    }

}

function populateRg(cb) {
    for (var i = 0, len = _tmpGroups.length; i < len; i++) {
        var rg = new ResourceGroup(_tmpGroups[i]);
        resourcegroups.push(rg);
        if(i == _tmpGroups.length-1) cb(null);
    }
}

function getVirtualnetworks(cb) {
    if (virtualnetworks.length < 1) {
        armnetworkclient.virtualNetworks.list(resourcegroups[0].name, (e, vnets) => {
            _tmpNetworks = vnets;
            cb(null);
        });
    } else {
        cb(null);
    }

}
function populateVnet(cb) {
    for (var i = 0, len = _tmpNetworks.length; i < len; i++) {
        var net = new VirtualNetwork(_tmpNetworks[i]);
        virtualnetworks.push(net);
        if(i == _tmpNetworks.length-1) cb(null);
    }
}

async.waterfall([
    setCredentials,
    setArmclient,
    setArmnetworkclient,
    getResourcegroups,
    populateRg,
    getVirtualnetworks,
    populateVnet

], function (error, result) {
    console.log("complete");
    console.log(resourcegroups);
    console.log(virtualnetworks);
});

// Authenticate using the passed in AppID and App Key against the specified AAD Tenant
// rest.loginWithServicePrincipalSecret(appid, appkey, tenant,
// (err, credentials) => {
//     if (err) throw err
//     else {
//         var rmClient = new resourcemanagement.ResourceManagementClient(credentials, subid);
//         rmClient.resourceGroups.list(function (err, groups) {
//             console.log(err);
//             console.log(groups);

//             var networkClient = new NetworkManagementClient(credentials, subid);
//             networkClient.virtualNetworks.list(rg.RGName, function (err, networks)

                // if (err) throw err;
                // else {
                //     async.eachSeries(groups, function(group, groupCallback) {
                //         // Loop through all of the Resource Groups within the given Sub and Tenant
                //         rg = new RGEntity(group.id, group.name, subid, tenant);
                //         var networkClient = new NetworkManagementClient(credentials, subid);
                //         networkClient.virtualNetworks.list(rg.RGName, function(err, networks) {
                //             if (err) throw err;
                //             else {
                //                 // Loop through all of the Networks within the given Resource Group
                //                 async.eachSeries(networks, function(vnet, vnetCallback) {
                //                     var vnetEntity = new NetworkEntity(vnet.id, vnet.name, vnet.location);
                //                     vnet.addressSpace.addressPrefixes.forEach(function(cidr, index) {
                //                         vnetEntity.CIDRs.push(cidr);
                //                     });

                //                     // Loop through all of the Subnets within the given Network
                //                     async.eachSeries(vnet.subnets, function(subnet, subnetCallback) {
                //                         var subnetEntity = null;
                //                         if (subnet.networkSecurityGroup === undefined) {
                //                             subnetEntity = new SubnetEntity(subnet.name, subnet.addressPrefix, '');
                //                         } else {
                //                             var nsgNameIndex = subnet.networkSecurityGroup.id.indexOf('networkSecurityGroups/');
                //                             var nsgName = subnet.networkSecurityGroup.id.substring(nsgNameIndex + 22);
                //                             var subnetEntity = new SubnetEntity(subnet.name, subnet.addressPrefix, nsgName);

                //                             // Need to get the NSG for the Subnet based on the Name
                //                             networkClient.networkSecurityGroups.get(rg.RGName, nsgName, function(err, nsg) {
                //                                 if (err) {
                //                                     console.log('Error retrieving Network Security Group', nsgName);
                //                                     throw err;
                //                                 } else {
                //                                     // Loop through the Rules for the given NSG
                //                                     async.eachSeries(nsg.securityRules, function(rule, ruleCallback) {
                //                                         var ruleEntity = new NSGRuleEntity(rule.name, rule.access, rule.protocol,
                //                                             rule.destinationAddressPrefix, rule.destinationPortRange,
                //                                             rule.sourceAddressPrefix, rule.sourcePortRange, rule.priority, rule.direction);
                //                                         console.log('NSG Rule: ', ruleEntity);
                //                                         subnetEntity.NSGRules.push(ruleEntity);
                //                                         ruleCallback();
                //                                     }, function(err) {
                //                                         if (err) {
                //                                             console.log('Error retrieving NSG Rules');
                //                                             throw err;
                //                                         }
                //                                     });
                //                                 }
                //                             });
                //                         }
                //                         console.log('Subnet: ', subnetEntity)
                //                         vnetEntity.Subnets.push(subnetEntity);
                //                         subnetCallback();
                //                     }, function(err) {
                //                         if (err) {
                //                             console.log('Error looping through the Network Subnets');
                //                             throw err;
                //                         }
                //                     });
                //                     console.log('VNet: ', vnetEntity);
                //                     rg.Networks.push(vnetEntity);
                //                     vnetCallback();
                //                 }, function(err) {
                //                     if (err) {
                //                         console.log('Error looping through the Networks');
                //                         throw err;
                //                     }
                //                 });
                //             }
                //         });
                //         groupCallback();
                //     }, function(err) {
                //         if (err) {
                //             console.log('Error looping through Resource Groups');
                //             throw err;
                //         }
                //     });
                //     console.log('Resources for group: ', rg);
                // }
//             });
//     }
// });




