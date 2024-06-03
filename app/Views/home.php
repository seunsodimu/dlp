<?= $this->extend("layouts/app") ?>

<?= $this->section("body") ?>
<div class="container-fluid relative px-3">
    <div class="layout-specing">
        <!-- Start Content -->
        <div class="grid lg:grid-cols-12 grid-cols-1 mt-6 gap-6">
            <div class="xl:col-span-6 lg:col-span-12">
                <div class="relative overflow-hidden rounded-md shadow dark:shadow-gray-700 bg-white dark:bg-slate-900">
                    <div class="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                        <h6 class="text-lg font-semibold">Quote</h6>

                        <a href="#"
                            class="relative inline-block font-semibold tracking-wide align-middle text-base text-center border-none after:content-[''] after:absolute after:h-px after:w-0 hover:after:w-full after:end-0 hover:after:end-auto after:bottom-0 after:start-0 after:transition-all after:duration-500 text-slate-400 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white after:bg-indigo-600 dark:after:bg-white duration-500">Upload
                            Quote Request <i class="uil uil-arrow-right"></i></a>
                    </div>
                    <form method="POST" action="<?= base_url('form-quote') ?>">
                    <div>
                        <div class="form-horizontal mt-5">
                            <div class="form-group row mx-3">
                                <h2 style="underline">Addresses</h2>
                                <div class="col-sm-6">
                                    <div class="InputAddOn"><span class="InputAddOn-item">Recipient Zipcode</span><input
                                            type="text" name="RecipientPostalCode" id="RecipientPostalCode"
                                            class="form-input" required="" placeholder="Recipient Zipcode" /></div>
                                    <br>
                                    <label><input type="checkbox" name="Residential" value="Y"> Residential</label>
                                </div>
                                <div class="col-sm-6">
                                    <div class="InputAddOn"><span class="InputAddOn-item">Shipper Zipcode</span><input
                                            type="text" name="ShipperPostalCode" id="ShipperPostalCode"
                                            class="form-input" required="" placeholder="Shipper Zipcode" /></div>
                                </div>
                            </div>
                        </div>
                        <div class="form-horizontal mt-5">
                            <div class="form-group row mx-3">
                                <h2 style="underline">Shipment Information</h2>
                                <div class="col-sm-6">
                                    <div class="InputAddOn"><span class="InputAddOn-item">Service Type</span>
                                        <select name="ServiceType" id="ServiceType" class="form-control select2">
                                            <option>All Services</option>
                                            <?php foreach ($services as $service): ?>
                                                <option value="<?= $service['servicetype_id'] ?>">
                                                    <?= $service['service_type'] ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="InputAddOn"><span class="InputAddOn-item">Package Type</span>
                                        <select name="PackagingType" id="PackagingType" class="form-control select2">
                                            <?php foreach ($packagetypes as $package_type): ?>
                                                <option value="<?= $package_type->package_type ?>">
                                                    <?= $package_type->package_type ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="form-horizontal mt-5">
                                <div class="form-group row mx-3">
                                    <div class="col-sm-6">
                                        <div class="InputAddOn"><span class="InputAddOn-item">Dropoff Type</span>
                                            <select name="DropoffType" id="DropoffType" class="form-control select2">
                                                <?php foreach ($dropofftypes as $dropoff_type): ?>
                                                    <option value="<?= $dropoff_type->dropoff_type ?>">
                                                        <?= $dropoff_type->dropoff_type ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="InputAddOn"><span class="InputAddOn-item">Declared Value</span>
                                            <input id="DeclaredValue" class="form-control" type="text" value=""
                                                name="DeclaredValue">
                                            <select id="DeclaredValueCurr" name="DeclaredValueCurr"
                                                class="form-control">
                                                <option>USD</option>
                                                <option>CD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-horizontal mt-5">
                                    <div class="form-group row mx-3">
                                        <div class="col-sm-6">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Ship Date</span>
                                                <input type="date" class="form-control" placeholder="mm/dd/yyyy"
                                                    name="ShipTimestamp" id="datepicker-autoclose"
                                                    value="<?= date('Y-m-d') ?>">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-horizontal mt-5">
                                    <div class="form-group row mx-3">
                                        <h2 style="underline">Package Information</h2>
                                        <div class="col-sm-3">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Count</span>
                                                <input type="number" min="1" name="GroupPackageCount" size="2"
                                                    class="form-control" value="1">
                                            </div>
                                        </div>
                                        <div class="col-sm-3">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Weight</span>
                                                <input type="number" min="1" name="WeightValue" id="WeightValue"
                                                    size="2" class="form-control" value="1">
                                            </div>
                                        </div>
                                        <div class="col-sm-3">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Dangerous Goods</span>
                                                <select class="form-control select2" name="DG">
                                                    <option value="">NONE</option>
                                                    <option value="INACCESSIBLE">Inaccessible dangerous goods</option>
                                                    <option value="ACCESSIBLE">Accessible dangerous goods</option>
                                                    <option>Hazmat</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-sm-3">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Dry Ice</span>
                                                <select class="form-control select2" name="DryIce" value="Y">
                                                    <option>No</option>
                                                    <option>Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-horizontal mt-5">
                                    <div class="form-group row mx-3">
                                        <div class="col-sm-4">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Length</span>
                                                <input type="number" class="form-control" size="3" min="1"
                                                    name="DimensionsLength" value="1">
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Width</span>
                                                <input type="number" class="form-control" size="2" min="1"
                                                    name="DimensionsWidth" value="1">
                                            </div>
                                        </div>
                                        <div class="col-sm-4">
                                            <div class="InputAddOn"><span class="InputAddOn-item">Height</span>
                                                <input class="form-control" type="number" size="2" min="1"
                                                    name="DimensionsHeight" value="1">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-horizontal mt-5">
                                    <div class="row mx-3">
                                        <h2 style="underline">Special Services</h2>
                                        <label><input type="checkbox" name="Alcohol" value="Y" /> Alcohol</label>
                                        <label><input type="checkbox" name="COD" value="Y" /> COD</label>
                                        <label><input type="checkbox" name="SaturdayDelivery" value="Y" /> Saturday
                                            Delivery</label>
                                        <label><input type="checkbox" name="SmartPost" value="Y" /> SmartPost</label>
                                    </div>
                                </div>
                                <div class="form-horizontal mt-5">
                                    <table border="0" cellspacing="5" cellpadding="5">
                                        <tr>
                                            <td>
                                                <label><input type="checkbox" name="HomeDeliveryOptions"
                                                        id="HomeDeliveryOptions" value="Y" /> Home Delivery
                                                    Options</label>
                                                <select name="HomeDeliveryOption" class="form_control">
                                                    <option>DATE_CERTAIN</option>
                                                    <option>EVENING</option>
                                                    <option>APPOINTMENT</option>
                                                </select>
                                            </td>
                                            <td>
                                                <label><input type="checkbox" name="SignatureOptions"
                                                        value="Y" /> Signature Options</label>
                                                <select name="SignatureOption" class="form_control">
                                                    <option>ADULT</option>
                                                    <option>INDIRECT</option>
                                                    <option>NO_SIGNATURE_REQUIRED</option>
                                                    <option>SERVICE_DEFAULT</option>
                                                    <option>STANDARD</option>
                                                </select>
                                            </td>
                                            <td>
                                                <label><input type="checkbox" name="Returns" id="Returns" value="Y" />
                                                    Returns</label>
                                                <select name="ReturnOption" class="form_control">
                                                    <option>FEDEX_TAG</option>
                                                    <option>PENDING</option>
                                                    <option>PRINT_RETURN_LABEL</option>
                                                </select>
                                            </td>
                                            <td>
                                                <label><input type="checkbox" name="PriorityAlert" id="PriorityAlert"
                                                        value="Y" /> Priority Alert</label>
                                                <select name="PriorityOption" class="">
                                                    <option>PRIORITY_ALERT_PLUS</option>
                                                    <option>PRIORITY_ALERT</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </table>
                                    <div class="form-horizontal mt-5 text-center mb-5">
                                       <input type="submit" class="py-2 px-5 inline-block font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-sky-500 hover:bg-sky-600 border-sky-500 hover:border-sky-600 text-white rounded-md" value="Get Quote" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div>
        <!-- End Content -->
    </div>
</div><!--end container-->

<?= $this->endSection() ?>