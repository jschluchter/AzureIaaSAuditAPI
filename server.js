var rest = require('ms-rest-azure');
var async = require('async');

var RGEntity = require('./entities/rgentity.js');
var NetworkEntity = require('./entities/networkentity.js');
var SubnetEntity = require('./entities/subnetentity.js');
var NSGRuleEntity = require('./entities/nsgruleentity.js');

var resourcemanagement = require('azure-arm-resource');
var NetworkManagementClient = require('azure-arm-network');

var appid = '1fe26dcf-39d9-4ba4-a138-1176496b658a';
var appkey = 'VE7wv8tCzasGmNrJ6SwAxykNOQncESy165tGca+XPZU=';
var tenant = 'feb0106c-50ef-4b39-8714-da9589109fcf';
var subid = '3a1ad284-92e6-4b05-b32c-e96edf011ed4';

// Authenticate using the passed in AppID and App Key against the specified AAD Tenant
rest.loginWithServicePrincipalSecret(appid, appkey, tenant,
    (err, credentials) => {
        if (err) throw err
        else {
            var rmClient = new resourcemanagement.ResourceManagementClient(credentials, subid);
            rmClient.resourceGroups.list(function(err, groups) {
                if (err) throw err;
                else {
                    async.eachSeries(groups, function(group, callback) {
                        // Loop through all of the Resource Groups within the given Sub and Tenant
                        rg = new RGEntity(group.id, group.name, subid, tenant);
                        var networkClient = new NetworkManagementClient(credentials, subid);
                        networkClient.virtualNetworks.list(rg.RGName, function(err, networks) {
                            if (err) throw err;
                            else {
                                // Loop through all of the Networks within the given Resource Group
                                async.eachSeries(networks, function(vnet, callback) {
                                    var vnetEntity = new NetworkEntity(vnet.id, vnet.name, vnet.location);
                                    vnet.addressSpace.addressPrefixes.forEach(function(cidr, index) {
                                        vnetEntity.CIDRs.push(cidr);
                                    });

                                    // Loop through all of the Subnets within the given Network
                                    async.eachSeries(vnet.subnets, function(subnet, callback) {
                                        var nsgNameIndex = subnet.networkSecurityGroup.id.indexOf('networkSecurityGroups/');
                                        var nsgName = subnet.networkSecurityGroup.id.substring(nsgNameIndex + 22);
                                        var subnetEntity = new SubnetEntity(subnet.name, subnet.addressPrefix, nsgName);

                                        // Need to get the NSG for the Subnet based on the Name
                                        networkClient.networkSecurityGroups.get(rg.RGName, nsgName, function(err, nsg) {
                                            if (err) {
                                                console.log('Error retrieving Network Security Group', nsgName);
                                                throw err;
                                            } else {
                                                // Loop through the Rules for the given NSG
                                                async.eachSeries(nsg.securityRules, function(rule, callback) {
                                                    var ruleEntity = new NSGRuleEntity(rule.name, rule.access, rule.protocol,
                                                        rule.destinationAddressPrefix, rule.destinationPortRange,
                                                        rule.sourceAddressPrefix, rule.sourcePortRange, rule.priority, rule.direction);
                                                    console.log('NSG Rule: ', ruleEntity);
                                                    subnetEntity.NSGRules.push(ruleEntity);
                                                }, function(err) {
                                                    if (err) {
                                                        console.log('Error retrieving NSG Rules');
                                                        throw err;
                                                    }
                                                });
                                            }
                                        });
                                        console.log('Subnet: ', subnetEntity)
                                        vnetEntity.Subnets.push(subnetEntity);
                                    }, function(err) {
                                        if (err) {
                                            console.log('Error looping through the Network Subnets');
                                            throw err;
                                        }
                                    });
                                    console.log('VNet: ', vnetEntity);
                                    rg.Networks.push(vnetEntity);
                                }, function(err) {
                                    if (err) {
                                        console.log('Error looping through the Networks');
                                        throw err;
                                    }
                                });
                            }
                        });
                    }, function(err) {
                        if (err) {
                            console.log('Error looping through Resource Groups');
                            throw err;
                        }
                    });
                    console.log('Resources for group: ', rg);
                }
            });
        }
    });