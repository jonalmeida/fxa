export default class Nimbus {
  static experiments: any;

  static async initialize(clientId: string, context: any) {
    const body = JSON.stringify({
      client_id: clientId,
      context,
    });

    const resp = await fetch('/nimbus-experiments', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // TODO: add error handling
    this.experiments = await resp.json();
    console.log(await this.experiments);
  }
}
