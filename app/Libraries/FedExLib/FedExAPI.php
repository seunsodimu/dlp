<?php 

namespace App\Libraries\FedExLib;

use Predis\Client as Redis;
use Predis\Connection\ConnectionException as ConnectionException;

class FedExAPI {
    private $client_id;
    private $client_secret;
    private $access_token;
    private $service_url;
    private $redis;

    public function __construct() {

        try {
            $this->redis = new Redis([
                'scheme' => 'tcp',
                'host'   => '127.0.0.1',
                'port'   => 6379,
            ]);
        } catch (ConnectionException $e) {
            // Handle connection error
            echo $e->getMessage();
        }
        $this->client_id = getenv('FEDEX_CLIENT_ID');
        $this->client_secret = getenv('FEDEX_CLIENT_SECRET');
        $this->service_url = getenv('FEDEX_SERVICE_URL');
        $this->authenticate();
    }

    private function authenticate() {
        //see if valid access token is already stored in redis


       
        if ($this->redis->exists('fedex_access_token')) {
            $this->access_token = $this->redis->get('fedex_access_token');
        }else {       
        
        $curl = curl_init();

        curl_setopt($curl, CURLOPT_URL, $this->service_url . '/oauth/token');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, 'grant_type=client_credentials&client_id=' . $this->client_id . '&client_secret=' . $this->client_secret);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

        $response = curl_exec($curl);
        curl_close($curl);

        $result = json_decode($response, true); //var_dump($result); die;
        $this->access_token = $result['access_token'] ?? '';
        $this->redis->set('fedex_access_token', $result['access_token']);
        $this->redis->expire('fedex_access_token', $result['expires_in']);
    }
    }

    private function sendRequest($method, $url, $body = null) {
        $curl = curl_init();

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->access_token,
        ];

        curl_setopt($curl, CURLOPT_URL, $this->service_url . $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        if ($body !== null) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body));
        }
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($curl);
        curl_close($curl);
        return json_decode($response, true);
    }

    public function getRates($shipmentDetails) {
        return $this->sendRequest('POST', '/rate/v1/rates/quotes', $shipmentDetails);
    }

    public function createShipment($shipmentDetails) {
        return $this->sendRequest('POST', '/ship/v1/shipments', $shipmentDetails);
    }

    public function createLabel($shipmentId) {
        return $this->sendRequest('POST', '/ship/v1/shipments/labels', ['shipmentId' => $shipmentId]);
    }

    public function trackShipment($trackingNumber) {
        return $this->sendRequest('GET', '/track/v1/trackingnumbers/' . $trackingNumber);
    }

   
}
