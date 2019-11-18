const path = require('path');
const fs = require('fs').promises;
const { promisify } = require("util");
const netstorage = require('netstorageapi');

module.exports = {
  provider: 'Akamai NetStorage',
  name: 'Akamai NetStorage',
  auth: {
    host: {
      label: 'Host',
      type: 'text',
    },
    keyName: {
      label: 'Upload Account Name',
      type: 'text'
    },
    key: {
      label: 'Key',
      type: 'password'
    },
    cpCode: {
      label: 'CPCode',
      type: 'text'
    },
    baseDir: {
      label: 'Base Directory',
      type: 'text'
    },
    baseUrl: {
      label: 'Base URL',
      type: 'text'
    }
  },
  init: config => {
    const { host, keyName, key, cpCode, baseDir, baseUrl } = config;

    const ns = new Netstorage({
      hostname: host,
      keyName: keyName,
      key: key,
      cpCode: cpCode,
      ssl: true
    });
    ns.upload = promisify(ns.upload.bind(ns));
    ns.delete = promisify(ns.delete.bind(ns));

    return {
      async upload(file) {
        const tmpDir = await fs.mkdtemp("strapi_upload");
        const tmpFile = path.join(tmpDir, file.name);
        await fs.writeFile(tmpFile, file.buffer);
        file.nsPath = path.join(cpCode, baseDir, path.basename(file.name));
        await ns.upload(tmpFile, file.nsPath);
        file.url = baseUrl + '/' + path.basename(file.name);

        return file;
      },
      async delete(file) {
        await ns.delete(file.nsPath);
      }
    };
  }
};
