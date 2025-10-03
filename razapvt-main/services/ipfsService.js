const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class IPFSService {
  constructor() {
    this.baseURL = 'http://127.0.0.1:5001/api/v0';
  }

  async isConnected() {
    try {
      const response = await axios.get(`${this.baseURL}/id`);
      return response.status === 200;
    } catch (error) {
      console.error('IPFS connection check failed:', error.message);
      return false;
    }
  }

  async getNodeInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/id`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get IPFS node info: ${error.message}`);
    }
  }

  async addFile(buffer, filename) {
    try {
      const form = new FormData();
      form.append('file', buffer, filename);
      
      const response = await axios.post(`${this.baseURL}/add`, form, {
        headers: {
          ...form.getHeaders(),
        },
        params: {
          'wrap-with-directory': false,
          'pin': true
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to add file to IPFS: ${error.message}`);
    }
  }

  async addJSON(data, filename = 'data.json') {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');
      return await this.addFile(buffer, filename);
    } catch (error) {
      throw new Error(`Failed to add JSON to IPFS: ${error.message}`);
    }
  }

  async getFile(hash) {
    try {
      const response = await axios.post(`${this.baseURL}/cat`, null, {
        params: {
          arg: hash
        },
        responseType: 'arraybuffer'
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to get file from IPFS: ${error.message}`);
    }
  }

  async getJSON(hash) {
    try {
      const buffer = await this.getFile(hash);
      const jsonString = buffer.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to get JSON from IPFS: ${error.message}`);
    }
  }

  async pinFile(hash) {
    try {
      const response = await axios.post(`${this.baseURL}/pin/add`, null, {
        params: {
          arg: hash
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to pin file: ${error.message}`);
    }
  }

  async unpinFile(hash) {
    try {
      const response = await axios.post(`${this.baseURL}/pin/rm`, null, {
        params: {
          arg: hash
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to unpin file: ${error.message}`);
    }
  }

  async getStats() {
    try {
      const [repoStats, swarmPeers] = await Promise.all([
        axios.get(`${this.baseURL}/repo/stat`),
        axios.get(`${this.baseURL}/swarm/peers`)
      ]);

      return {
        repo: repoStats.data,
        peers: swarmPeers.data.Peers ? swarmPeers.data.Peers.length : 0
      };
    } catch (error) {
      throw new Error(`Failed to get IPFS stats: ${error.message}`);
    }
  }

  getGatewayURL(hash) {
    return `http://127.0.0.1:8080/ipfs/${hash}`;
  }

  getPublicGatewayURL(hash) {
    return `https://ipfs.io/ipfs/${hash}`;
  }
}

module.exports = new IPFSService();
