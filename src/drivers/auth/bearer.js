export default {
  request: function (req, token) {
    this.drivers.http.setHeaders.call(this, req, {
      Authorization: 'Bearer ' + token
    });
  },

  response: function (res) {
    const httpData = this.drivers.http.httpData(res);

    if (httpData.hasOwnProperty('access_token')) {
      return httpData['access_token'];
    }
  }
};