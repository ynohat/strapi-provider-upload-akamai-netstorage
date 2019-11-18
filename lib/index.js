const path = require('path');
const fs = require('fs').promises;
const { promisify } = require("util");
const Netstorage = require('netstorageapi');

module.exports = {
  provider: 'Akamai NetStorage',
  name: 'Akamai NetStorage',
  auth: {
    baseUrl: {
      label: 'Base URL',
      type: 'text'
    },
    basePath: {
      label: 'Base Path',
      type: 'text'
    },
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
  },
  init: config => {
    const { host, keyName, key, cpCode, basePath, baseUrl } = config;

    const ns = new Netstorage({
      hostname: host,
      keyName: keyName,
      key: key,
      cpCode: cpCode,
      ssl: true
    });
    ns.upload = promisify(ns.upload);
    ns.delete = promisify(ns.delete);

    return {
      async upload(file) {
        const tmpDir = await fs.mkdtemp("strapi_upload");
        const tmpFile = path.join(tmpDir, file.hash+file.ext);
        await fs.writeFile(tmpFile, file.buffer);
        const nsPath = path.join(cpCode, basePath, file.hash+file.ext);
        await ns.upload(tmpFile, nsPath);
        file.url = path.join(baseUrl, file.hash+file.ext);
      },
      async delete(file) {
        try {
          const nsPath = path.join(cpCode, basePath, file.hash+file.ext);
          await ns.delete(nsPath);
        } catch (err) {
          // do nothing (because I don't know where to log!)
        }
      }
    };
  }
};
