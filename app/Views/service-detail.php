<?= $this->extend("layouts/card") ?>

<?= $this->section("body") ?>
<div class="page-wrapper toggled">
    <div class="container-fluid relative px-3">
                    <div class="layout-specing">

                        <div class="container relative mt-6">
                            <div class="md:flex justify-center">
                                <div class="lg:w-4/5 w-full">
                                    <div class="p-6 rounded-md shadow dark:shadow-gray-700 bg-white dark:bg-slate-900">
                                        <div class="border-b border-gray-100 dark:border-gray-700 pb-6">
                                            <div class="md:flex justify-between">
                                                <div>
                                                    <img src="assets/images/logo-dark.png" class="block dark:hidden" alt="">
                                                    <img src="assets/images/logo-light.png" class="hidden dark:block" alt="">
                                                    <div class="flex mt-4">
                                                        <i data-feather="link" class="h-4 w-4 me-3 mt-1"></i>
                                                        <?=  $service['service_name'] ?>
                                                    </div>
                                                </div>
            
                                                <div class="mt-6 md:mt-0 md:w-56">
                                                    
                                                </div>
                                            </div>
                                        </div>
            
                                        <div class="md:flex justify-between">
                                            <div class="mt-6">
                                                <h5 class="text-lg font-semibold">Shipment Details :</h5>
            
                                                <ul class="list-none">
                                                    <li class="flex mt-3">
                                                        <span class="w-24">Shipper :</span>
                                                        <i data-feather="map-pin" class="h-4 w-4 me-3 mt-1"></i><?= $service['post']['shipperStateOrProvinceCode'].', '.$service['post']['ShipperPostalCode'] ?>
                                                    </li>
                                                    
                                                    <li class="flex mt-3">
                                                        <span class="w-24">Recipient :</span>
                                                        <i data-feather="map-pin" class="h-4 w-4 me-3 mt-1"></i><?= $service['post']['recipientStateOrProvinceCode'].', '.$service['post']['RecipientPostalCode'] ?>
                                                    </li>
                                                </ul>
                                            </div>
            
                                            <div class="mt-3 md:w-76">
                                                <ul class="list-none">
                                                    <li class="flex mt-3">
                                                        <span class="w-24">Shipment Date :</span>
                                                        <span class="text-slate-400"><?= $service['post']['ShipTimestamp'] ?></span>
                                                    </li>
                                                    <li class="flex mt-3">
                                                        <span class="w-24">Delivery Date :</span>
                                                        <span class="text-slate-400"><?= $service['deliveryDate'] ?></span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div class="relative overflow-x-auto shadow dark:shadow-gray-700 rounded-md mt-6">
                                            <table class="w-full text-start text-slate-500 dark:text-slate-400">
                                                <thead class="text-sm uppercase bg-slate-50 dark:bg-slate-800">
                                                    <tr>
                                                        <th scope="col" class="text-start px-6 py-3">
                                                            Charge
                                                        </th>
                                                        <th scope="col" class="text-center px-6 py-3 w-28">
                                                            Original
                                                        </th>
                                                        <th scope="col" class="text-end px-6 py-3 w-40">
                                                            Marked Up
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <?php foreach ($service['surCharges'] as $surcharge) : ?>
                                                        <tr class="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-700">
                                                            <th scope="row" class="text-end px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                                <?= $surcharge['description'] ?>
                                                            </th>
                                                            <td class="text-end px-6 py-4">
                                                                $<?= $surcharge['amount'] ?>
                                                            </td>
                                                            <td class="text-end px-6 py-4">
                                                                $<?= $surcharge['amount_new'] ?>
                                                            </td>
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <tr class="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-700">
                                                        <th scope="row" class="text-start px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                            Total Surcharge
                                                        </th>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalSurcharges'] ?>
                                                        </td>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalSurcharges_new'] ?>
                                                        </td>
                                                    </tr>
                                                    <tr class="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-700">
                                                        <th scope="row" class="text-start px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                            Total Base Charge
                                                        </th>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalBaseCharge'] ?>
                                                        </td>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalBaseCharge_new'] ?>
                                                        </td>
                                                    </tr>
                                                    <tr class="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-700">
                                                        <th scope="row" class="text-start px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                            Total Net Charge
                                                        </th>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalNetCharge'] ?>
                                                        </td>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalNetCharge_new'] ?>
                                                        </td>
                                                    </tr>
                                                    <tr class="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-700">
                                                        <th scope="row" class="text-start px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                            Total Net FedEx Charge
                                                        </th>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalNetFedExCharge'] ?>
                                                        </td>
                                                        <td class="text-end px-6 py-4">
                                                            $<?= $service['totalNetFedExCharge_new'] ?>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
            
                                        <!-- <div class="w-56 ms-auto p-5">
                                            <ul class="list-none">
                                                <li class="text-slate-400 flex justify-between">
                                                    <span>Subtotal :</span>
                                                    <span>$ 520</span>
                                                </li>
                                                <li class="text-slate-400 flex justify-between mt-2">
                                                    <span>Taxes :</span>
                                                    <span>$ 20</span>
                                                </li>
                                                <li class="flex justify-between font-semibold mt-2">
                                                    <span>Total :</span>
                                                    <span>$ 540</span>
                                                </li>
                                            </ul>
                                        </div> -->
            
                                        <div class="invoice-footer border-t border-gray-100 dark:border-gray-700 pt-6">
                                            <div class="md:flex justify-between">
                                                <div>
                                                    <div class="text-slate-400 text-center md:text-start">
                                                        <h6 class="mb-0">Fuel Surcharge Percent : <?= $service['fuelSurchargePercent'].'%' ?></h6>
                                                    </div>
                                                </div>
            
                                                <div class="mt-4 md:mt-0">
                                                <div class="text-slate-400 text-center md:text-start">
                                                        <h6 class="mb-0">Total Freight Discount : <?= $service['totalFreightDiscount'].'%' ?></h6>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div><!--end grid-->
                        </div><!--end container-->
                        <!-- End Content -->
                    </div>
                </div><!--end container-->
    </div>
<?= $this->endSection() ?>