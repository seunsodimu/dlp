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
                    <div class="grid grid-cols-1 mt-6">
                            <div class="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 rounded-md">
                                <table class="w-full text-start">
                                    <thead class="text-base">
                                        <tr>
                                            <th class="text-start p-4 min-w-[128px]">Service</th>
                                            <th class="text-center p-4">Total Surcharges</th>
                                            <th class="text-center p-4">Total Surcharges(New)</th>
                                            <th class="text-start p-4 min-w-[192px]">Total Base Charge</th>
                                            <th class="text-center p-4 min-w-[200px]">Total Base Charge(New)</th>
                                            <th class="text-center p-4">Total Net Charge</th>
                                            <th class="text-center p-4 min-w-[150px]">Total Net Charge(New)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($services as $service) : ?>
                                            <tr>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                <a href="#" data-bs-toggle="modal" data-bs-target="#serviceDetailModal" data-cacheKey="<?= $service['cacheKey'] ?>">
                                                <span class="font-semibold"><?= $service['service_type'] ?></span></a>
                                                </td>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span class="text-slate-400">$<?= $service['totalSurcharges'] ?></span>
                                                </td>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span class="text-slate-400">$<?= $service['totalSurcharges_new'] ?></span>
                                                </td>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span class="text-slate-400">$<?= $service['totalBaseCharge'] ?></span>
                                                </td>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span class="text-slate-400">$<?= $service['totalBaseCharge_new'] ?></span>
                                                </td>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span class="text-slate-400">$<?= $service['totalNetCharge'] ?></span>
                                                </td>
                                                <td class="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span class="text-slate-400">$<?= $service['totalNetCharge_new'] ?></span>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>

                            <div class="mt-5 flex items-center justify-between">
                                <div>
                                    <a href="#" class="h-8 w-8 inline-flex items-center justify-center font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full"><i class="mdi mdi-arrow-left"></i></a>
                                    <a href="#" class="h-8 w-8 inline-flex items-center justify-center font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full"><i class="mdi mdi-arrow-right"></i></a>
                                </div>

                                <span class="text-slate-400">Showing 1 - 8 out of 45</span>
                            </div>
                        </div>
                </div>
            </div>
        </div>
        <!-- End Content -->
    </div>
</div><!--end container-->
<div class="modal fade" id="serviceDetailModal" tabindex="-1" aria-labelledby="serviceDetailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="serviceDetailModalLabel">New Product Category</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="prodCatForm" action="<?= base_url('product-categories') ?>" method="post">
                <div class="modal-body">
                   
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?= $this->endSection() ?>
<?= $this->section("scripts") ?>
<script>
    $(document).ready(function () {
        $('#serviceDetailModal').on('show.bs.modal', function (event) {
            var button = $(event.relatedTarget);
            var cacheKey = button.data('cacheKey');
            var modal = $(this);
            modal.find('.modal-body').load('<?= base_url('service-detail') ?>/' + cacheKey);
        });
    });
</script>