# Automating Upgrades of Tangerine

If you have a particularly complex upgrade of Tangerine that involves changing configurations, writing your own upgrade script and testing that on a QA server can be a way to ensure smooth upgrades when you go to production. Below you will find various tips and tricks we've discovered along the way of writing our own upgrade scripts.


## Update a group's configuration in the groups database

In this example, we modify the `xyz` group's configuration to implement some csvReplacementCharacters. First we install into the container the jq utility for modifying JSON on the command line, then we modify the group's config doc in the second command. To use this example, replace the two `xyz` instances with the group's ID you want to modify.

```bash
docker exec -it tangerine apt install -y jq
docker exec -it tangerine bash -c 'curl -s $T_COUCHDB_ENDPOINT/groups/xyz | jq ".csvReplacementCharacters = [[\",\",\"|\"],[\"\n\",\"___\"]]" | curl -s -T - -H "Content-Type: application/json" -X PUT $T_COUCHDB_ENDPOINT/groups/xyz'
```

## Updating a group's content repository

Given the upgrade of Tangerine, there may be associated content changes required. Set up an deploy key in your content repository on github and modify the following script to suit your needs.

```bash
cd /path-to-tangerine/tangerine/data/groups/some-group-id/
GIT_SSH_COMMAND='ssh -i /root/.ssh/id_github.pub' git fetch origin
git checkout v2.0.0
```

## Update a group's app-config.json
Best practice for ensuring that configuration in `client/app-config.json` is maintained over time is to first update the configuration you want to modify in your group's `client/app-config.defaults.json` and then retemplate the defaults to the `client/app-config.json` file. To use the following example, replace instances of `group-xyz` with the relevant Group ID and `GROUP XYZ` with the relevant Group Name.

```
docker exec -it tangerine apt install -y jq
docker exec -it tangerine bash -c 'cat /tangerine/groups/group-xyz/client/app-config.defaults.json | jq ".serverUrl = \"$T_PROTOCOL://$T_HOST_NAME\"" | jq ".groupId = \"group-xyz\"" | jq ".groupName = \"Group XYZ\"" > /tangerine/groups/group-xyz/client/app-config.json'
```
