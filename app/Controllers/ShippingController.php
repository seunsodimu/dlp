<?php

namespace App\Controllers;

// require easypost-php library from composer
require_once APPPATH . '../vendor/autoload.php';
use App\Models\UserModel;
use App\Models\ServiceModel;
use Predis\Client as Redis;

use FedEx\RateService\Request;
use FedEx\RateService\ComplexType;
use FedEx\RateService\SimpleType;
use EasyPost\EasyPostClient;
use App\Libraries\FedExLib\FedExAPI;

class ShippingController extends BaseController
{
   private $client;
   private $redis;
   public function __construct()
   {
      // $this->client = new EasyPostClient(getenv('EASYPOST_API_KEY'));
      // $this->client = new \EasyPost\EasyPostClient(getenv('EASYPOST_API_KEY'));
      $this->redis = new Redis([
         'scheme' => 'tcp',
         'host' => 'localhost',
         'port' => 6379,
      ]);
   }

   public function getRatesWithCaching($params, $type)
   {
      $paramsKeySingle = 'rates_params';
      $responseKeySingle = 'rates_response';
      $paramsKeyMulti = 'rates_params_multi';
      $responseKeyMulti = 'rates_response_multi';

      $paramsKey = $type == 'multi' ? $paramsKeyMulti : $paramsKeySingle;
      $responseKey = $type == 'multi' ? $responseKeyMulti : $responseKeySingle;

      $cachedParams = $this->redis->get($paramsKey);
      $cachedResponse = $this->redis->get($responseKey);
      // var_dump($params['fromAddress']); die;

      if ($cachedParams && $cachedResponse && $cachedParams === json_encode($params)) {
         // If the parameters are the same as last time, return the cached response
         // var_dump($cachedResponse); die;
         return $cachedResponse;
      }

      if ($type == 'multi') {
         $response = $this->getOrderRates($params['fromAddress'], $params['toAddress'], $params['parcels']);
         $this->redis->set($paramsKey, json_encode($params));
         $this->redis->set($responseKey, json_encode($response));
      } else {
         $response = $this->getStatelessRates($params['fromAddress'], $params['toAddress'], $params['parcels']);
         $this->redis->set($paramsKey, json_encode($params));
         $this->redis->set($responseKey, json_encode($response));
      }
      // $response = json_encode($response);
      //   var_dump($response[0]->service); die;
      return $response;
   }

   public function getRates($fromAddress, $toAddress, $parcel)
   {
      $shipment = $this->client->shipment->create([
         "from_address" => $fromAddress,
         "to_address" => $toAddress,
         "parcel" => $parcel,
         "options" => [
            "carrier_accounts" => ["ca_f10d3218de8244da8aacd1b9e40c0ba7"],
            "service" => "EconomySelect",
         ]
      ]);
      return $shipment->rates;
   }
   public function getStatelessRates($fromAddress, $toAddress, $parcel)
   {
      $shipment = $this->client->betaRate->retrieveStatelessRates([
         "from_address" => $fromAddress,
         "to_address" => $toAddress,
         "parcel" => $parcel,
         "options" => [
            "carrier_accounts" => ["ca_f10d3218de8244da8aacd1b9e40c0ba7"],
            "service" => "EconomySelect",
         ]
      ]);
      return $shipment;
   }

   public function getOrderRates($fromAddress, $toAddress, $parcel)
   {
      $shipment = $this->client->order->create([
         "from_address" => $fromAddress,
         "to_address" => $toAddress,
         "shipments" => $parcel
      ]);
      return $shipment;
   }

   public function createLabel($shipmentId)
   {
      $shipment = $this->client->shipment->retrieve($shipmentId);
      $shipment->buy($shipment->lowest_rate());

      return $shipment->postage_label->label_url;
   }

   public function checkStatus($shipmentId)
   {
      $shipment = $this->client->shipment->retrieve($shipmentId);

      return $shipment->tracking_code;
   }

   public function webhookListener()
   {
      $payload = file_get_contents('php://input');
      $webhook = $$this->client->shipment->webhook->constructFrom($payload, null, true);

      // Handle the webhook event (e.g., update shipment status in your database)
   }




   public function fedexRequest($endpoint, $post, $header = null)
   {
      $ch = curl_init(getenv('FEDEX_API_URL') . $endpoint);
      curl_setopt_array($ch, [
         CURLOPT_SSL_VERIFYPEER => true,
         CURLOPT_SSL_VERIFYHOST => 2,
         CURLOPT_RETURNTRANSFER => true,
         CURLOPT_FOLLOWLOCATION => true,
         CURLOPT_CONNECTTIMEOUT => 5,
         CURLOPT_POSTFIELDS => $post,
      ]);
      if ($header)
         curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
      return curl_exec($ch);
   }

   public function testFdx4()
   {
      $fdx = new FedExAPI();
      $token = $this->redis->get('fedex_access_token');
      //   var_dump($token); exit;
      //clear token
      // $this->redis->del('fedex_access_token'); exit;

      $headers = [
         'Content-Type: application/json',
         'Accept: application/json',
         'Authorization: Bearer ' . $token,
         'X-locale: en_US',
         'Pragma: no-cache',
         'Cache-Control: no-cache, no-store'
      ];

      $url = getenv('FEDEX_SERVICE_URL') . "/rate/v1/rates/quotes";

      $payload["accountNumber"] = [
         "value" => getenv('FEDEX_ACCOUNT_NUMBER')
      ];

      $payload["rateRequestControlParameters"]["returnTransitTimes"] = true;

      $payload["requestedShipment"] = [];

      $payload["requestedShipment"]["shipper"]["address"] = [
         "postalCode" => "33762",
         "stateOrProvinceCode" => "FL",
         "countryCode" => "US"
      ];

      $payload["requestedShipment"]["recipient"]["address"] = [
         "postalCode" => "76052",
         "stateOrProvinceCode" => "TX",
         "countryCode" => "US"
      ];

      $payload["requestedShipment"]["pickupType"] = "DROPOFF_AT_FEDEX_LOCATION";

      $payload["requestedShipment"]["requestedPackageLineItems"][0] = [
         "weight" => [
            "units" => "LB",
            "value" => 10
         ],
         "dimensions" => [
            "length" => 10,
            "width" => 8,
            "height" => 2,
            "units" => "IN"
         ]
      ];
      //multiple packages
      $payload["requestedShipment"]["requestedPackageLineItems"][1] = [
         "weight" => [
            "units" => "LB",
            "value" => 20
         ],
         "dimensions" => [
            "length" => 20,
            "width" => 18,
            "height" => 12,
            "units" => "IN"
         ]
      ];

      $payload["requestedShipment"]["rateRequestType"] = ["ACCOUNT"];
      $payload["requestedShipment"]["shipDateStamp"] = "2024-05-18";
      $payload["requestedShipment"]["serviceType"] = "FEDEX_GROUND";
      //  payor account number
      $payload["requestedShipment"]["shipper"]["accountNumber"] = getenv('FEDEX_ACCOUNT_NUMBER');
      // $payload["requestedShipment"]["shippingChargesPayment"] = [
      //       "paymentType" => "SENDER",
      //       "payor" => [
      //             "responsibleParty" => [
      //                "accountNumber" => [
      //                   "value" => getenv('FEDEX_ACCOUNT_NUMBER')
      //                ]
      //             ]
      //       ]
      //    ]; 
      // var_dump($payload['accountNumber']); 
      // var_dump($payload['requestedShipment']['shippingChargesPayment']['payor']['responsibleParty']['accountNumber']['value']); exit;
      // exit;
// var_dump($payload); exit;
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, true);

      curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); // Added this on local system to avoid SSL error
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); // Added this on local system to avoid SSL error
      curl_setopt($ch, CURLOPT_ENCODING, "gzip"); // Added this to decode the response
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");

      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

      curl_setopt($ch, CURLINFO_HEADER_OUT, true);

      $output = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
      $curlerr = curl_error($ch);
      $header_out = curl_getinfo($ch);
      curl_close($ch);

      // TO DEBUG OUTPUT
      echo "OUTPUT: " . $output . "<br><br>";
      echo "HTTP STATUS: " . $http_status . "<br><br>";
      echo "CONTENT TYPE: " . $content_type . "<br><br>";
      echo "ERROR: " . $curlerr . "<br><br><hr><br><br>";
      //   exit;
      $json = json_decode($output, true);
      foreach ($json['output']['rateReplyDetails'] as $rateReplyDetails) {
         // loop through the ratedShipmentDetails
         echo $rateReplyDetails['serviceType'] . ' - ';
         // delivery date
         echo $rateReplyDetails['commit']['dateDetail']['dayOfWeek'] . ' ';
         echo $rateReplyDetails['commit']['dateDetail']['dayFormat'] . '<br>';
         // exit;
         //   foreach($rateReplyDetails['ratedShipmentDetails'] as $ratedShipmentDetails){
         //       // loop through the ratedPackages
         //       foreach($ratedShipmentDetails['ratedPackages'] as $ratedPackages){
         //           // get the netCharge
         //           $netCharge = $ratedPackages['packageRateDetail']['netCharge'];
         //           // get the currency
         //           $currency = $ratedPackages['packageRateDetail']['currency'];
         //           // output the netCharge and currency
         //           echo $netCharge . ' ' . $currency . '<br>';
         //       }
         //   }
         echo "total discount: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalDiscounts'] . "<br>";
         echo "total base charge: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalBaseCharge'] . "<br>";
         echo "total net charge: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalNetCharge'] . "<br>";
         echo "total net fedex charge: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalNetFedExCharge'] . "<br>";
         echo "fuel Surcharge Percent: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['fuelSurchargePercent'] . "<br>";
         echo "total surcharges: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalSurcharges'] . "<br>";
         echo "total freight discount: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalFreightDiscount'] . "<br>";
         echo "total billing weight: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalBillingWeight']['value'] . "<br>";
         echo "Surcharges: <br>";
         foreach ($rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['surCharges'] as $surCharges) {
            // echo "type: ".$surCharges['type']."<br>";
            echo "description: " . $surCharges['description'] . ": " . $surCharges['amount'] . "<br>";
            // echo "amount: ".$surCharges['amount']."<br>";
         }
      }

   }

   public function getFDXRate()
   {
      $cache = \Config\Services::cache();
      $fdx = new FedExAPI();
      $token = $this->redis->get('fedex_access_token');
      $model = new ServiceModel();
      //   var_dump($token); exit;
      //clear token
      // $this->redis->del('fedex_access_token'); exit;
      $post = $this->request->getPost();
      $post['shipperStateOrProvinceCode'] = $model->getStateFromZip($post['ShipperPostalCode']);
      $post['recipientStateOrProvinceCode'] = $model->getStateFromZip($post['RecipientPostalCode']);

      
      $headers = [
         'Content-Type: application/json',
         'Accept: application/json',
         'Authorization: Bearer ' . $token,
         'X-locale: en_US',
         'Pragma: no-cache',
         'Cache-Control: no-cache, no-store'
      ];

      $url = getenv('FEDEX_SERVICE_URL') . "/rate/v1/rates/quotes";

      $payload["accountNumber"] = [
         "value" => getenv('FEDEX_ACCOUNT_NUMBER')
      ];

      $payload["rateRequestControlParameters"]["returnTransitTimes"] = true;

      $payload["requestedShipment"] = [];

      $payload["requestedShipment"]["shipper"]["address"] = [
         "postalCode" => $post['ShipperPostalCode'],
         "stateOrProvinceCode" => $post['shipperStateOrProvinceCode'],
         "countryCode" => "US"
      ];

      $payload["requestedShipment"]["recipient"]["address"] = [
         "postalCode" => $post['RecipientPostalCode'],
         "stateOrProvinceCode" => $post['recipientStateOrProvinceCode'],
         "countryCode" => "US"
      ];

      $payload["requestedShipment"]["pickupType"] = $post['DropoffType'];

      $payload["requestedShipment"]["requestedPackageLineItems"][0] = [
         "weight" => [
            "units" => "LB",
            "value" => $post['WeightValue']
         ],
         "dimensions" => [
            "length" => $post['DimensionsLength'],
            "width" => $post['DimensionsWidth'],
            "height" => $post['DimensionsHeight'],
            "units" => "IN"
         ]
      ];


      $payload["requestedShipment"]["rateRequestType"] = ["ACCOUNT"];
      $payload["requestedShipment"]["shipDateStamp"] = $post['ShipTimestamp'];
      if ($post['ServiceType'] != "All Services") {
         $payload["requestedShipment"]["serviceType"] = $post['ServiceType'];
      }
      // Signature option
      if ($post['SignatureOptions'] == "Y") {
         $payload["requestedShipment"]["specialServicesRequested"] = [
            "specialServiceTypes" => $post['SignatureOption']
         ];
      }
      // PRIORITY ALERT
      if ($post['PriorityAlert'] == "Y") {
         $payload["requestedShipment"]["specialServicesRequested"] = [
            "specialServiceTypes" => $post['PriorityOption']
         ];
      }
      // DANGEROUS GOODS
      if ($post['DG'] != "NONE") {
         $payload["requestedShipment"]["specialServicesRequested"] = [
            "specialServiceTypes" => $post['DG']
         ];
      }     
      
      
      // var_dump($payload); exit;
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, true);

      curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); // Added this on local system to avoid SSL error
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); // Added this on local system to avoid SSL error
      curl_setopt($ch, CURLOPT_ENCODING, "gzip"); // Added this to decode the response
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");

      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

      curl_setopt($ch, CURLINFO_HEADER_OUT, true);

      $output = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
      $curlerr = curl_error($ch);
      $header_out = curl_getinfo($ch);
      curl_close($ch);
      // var_dump($output); exit;
// TO DEBUG OUTPUT
// echo "OUTPUT: ".$output."<br><br>";
// echo "HTTP STATUS: ".$http_status."<br><br>";
// echo "CONTENT TYPE: ".$content_type."<br><br>";
// echo "ERROR: ".$curlerr."<br><br><hr><br><br>";
//   exit;
      $json = json_decode($output, true);
      $data = [];
      $services = [];
      foreach ($json['output']['rateReplyDetails'] as $rateReplyDetails) {
         // loop through the ratedShipmentDetails
         // echo $rateReplyDetails['serviceType'] . ' - ';
         // delivery date
         // echo $rateReplyDetails['commit']['dateDetail']['dayOfWeek'] . ' ';
         // echo $rateReplyDetails['commit']['dateDetail']['dayFormat'] . '<br>';

         // echo "total discount: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalDiscounts'] . "<br>";
         // echo "total base charge: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalBaseCharge'] . "<br>";
         // echo "total net charge: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalNetCharge'] . "<br>";
         // echo "total net fedex charge: " . $rateReplyDetails['ratedShipmentDetails'][0]['totalNetFedExCharge'] . "<br>";
         // echo "fuel Surcharge Percent: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['fuelSurchargePercent'] . "<br>";
         // echo "total surcharges: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalSurcharges'] . "<br>";
         // echo "total freight discount: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalFreightDiscount'] . "<br>";
         // echo "total billing weight: " . $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalBillingWeight']['value'] . "<br>";
         // echo "Surcharges: <br>";
         $service['surCharges'] = [];
         $total_surcharge_new = 0;
         foreach ($rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['surCharges'] as $surCharges) {
            // echo "type: ".$surCharges['type']."<br>";
            // echo "description: " . $surCharges['description'] . ": " . $surCharges['amount'] . "<br>";
            $surcharge = $surCharges['description'];
            $amount = $surCharges['amount'];
            $amount_new = $this->upcharge($surcharge, $amount);
            $total_surcharge_new += $amount_new;
            array_push($service['surCharges'], ['description' => $surcharge, 'amount' => $amount, 'amount_new' => $amount_new]);
            // echo "amount: ".$surCharges['amount']."<br>";
         }
         $service['service_type'] = $rateReplyDetails['serviceType'];
         $service['service_name'] = $rateReplyDetails['serviceName'];
         $service['deliveryDate'] = $rateReplyDetails['commit']['dateDetail']['dayOfWeek'] . ' ' . $rateReplyDetails['commit']['dateDetail']['dayFormat'];
         $service['totalDiscount'] = $rateReplyDetails['ratedShipmentDetails'][0]['totalDiscounts'];
         $service['totalBaseCharge'] = $rateReplyDetails['ratedShipmentDetails'][0]['totalBaseCharge'];
         $service['totalNetCharge'] = $rateReplyDetails['ratedShipmentDetails'][0]['totalNetCharge'];
         $service['totalNetFedExCharge'] = $rateReplyDetails['ratedShipmentDetails'][0]['totalNetFedExCharge'];
         $service['fuelSurchargePercent'] = $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['fuelSurchargePercent'];
         $service['totalSurcharges'] = $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalSurcharges'];
         $service['totalFreightDiscount'] = $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalFreightDiscount'];
         $service['totalBillingWeight'] = $rateReplyDetails['ratedShipmentDetails'][0]['shipmentRateDetail']['totalBillingWeight']['value'];
         $service['totalBaseCharge_new'] = $this->upcharge('totalBaseCharge', $service['totalBaseCharge']);
         $service['totalNetCharge_new'] = $this->upcharge('totalNetCharge', $service['totalNetCharge']);
         $service['totalNetFedExCharge_new'] = $this->upcharge('totalNetFedExCharge', $service['totalNetFedExCharge']);
         $service['totalSurcharges_new'] = $total_surcharge_new;
         $service['totalFreightDiscount_new'] = $this->upcharge('totalFreightDiscount', $service['totalFreightDiscount']);
         $cacheKey = 'fdx_rate_service_'.$service['service_type'];
         $service['cacheKey'] = $cacheKey;
         $service['post'] = $post;
         $cache->save($cacheKey, $service, 3000);
         array_push($services, $service);
      }
      $data['services'] = $services;
      $data['post'] = $post;
      return view('rate-list', $data);
   }


   public function serviceDetail($cacheKey)
   {
      $service = $this->getServiceCache($cacheKey);
      $data = ['service' => $service['data'] ?? 'No data found'];
      return view('service-detail', $data);
   }

   public function getServiceCache($cacheKey = 'fdx_rate_service_FEDEX_GROUND'){
      $cache = \Config\Services::cache();
      $service = $cache->get($cacheKey);
      if($service!= null){
         $response = ['status'=>'success', 'data'=>$service];
      }else{
         $response = ['status' => 'fail'];
      }
      return $response;
   }

   public function updateUpcharge()
   {
      $post = $this->request->getPost();
      $model = new ServiceModel();
      $model->updateUpcharge($post['id'], $post);
      return json_encode('success');
   }

   private function upcharge($field, $value)
   {
      $model = new ServiceModel();
      $charges = $model->getUpcharge($field);
      $new_value = $value;
      if($charges){
      if($charges->upcharge_perc1 != 0){
       $new_value = $new_value + ($new_value * $charges->upcharge_perc1/100); 
      }
      if($charges->upcharge_perc2 != 0){
       $new_value = $new_value + ($new_value * $charges->upcharge_perc2/100); 
      }
   }
      return $new_value;
   }

}