<?= $this->extend("layouts/app") ?>

<?= $this->section("body") ?>
<div class="container-fluid relative px-3">
    <div class="layout-specing">
        <!-- Start Content -->
        <div class="grid lg:grid-cols-12 grid-cols-1 mt-6 gap-6">
            <div class="xl:col-span-6 lg:col-span-12">
                <div class="relative overflow-hidden rounded-md shadow dark:shadow-gray-700 bg-white dark:bg-slate-900">
                    <div class="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                        <h6 class="text-lg font-semibold">Markup Settings</h6>
                
               
                
                    </div>
                    <div class="">
                        <table class="w-full text-start mt-6 mx-3 my-3">
                            <tbody>
                    <?php foreach($upcharges as $upcharge): 
                        if($upcharge->field !='totalNetFedExCharge'){
                        $field = preg_split('/(?=[A-Z])/', $upcharge->field);
                        $field = implode(' ', $field);
                        }else{
                            $field = 'Total Net FedEx Charge';}
                        ?>
                    <tr>
                    <td>
                        <label class="form-label"><?= ucwords($field) ?></label>
                        </td>
                        <td class="min-w-[40px]">
                        <div class="InputAddOn"><span class="InputAddOn-item">Markup 1 (%)</span>
                        <input type="number" name="upchargePerc1_<?= $upcharge->id ?>" id="upchargePerc1_<?= $upcharge->id ?>" class="form-input" style="width: 100px" value="<?= $upcharge->upcharge_perc1 ?>">
                        </div>
                        </td>
                        <td class="min-w-[40px]">
                        <div class="InputAddOn"><span class="InputAddOn-item">Markup 2 (%)</span>
                        <input type="number" name="upchargePerc2_<?= $upcharge->id ?>" id="upchargePerc2_<?= $upcharge->id ?>" class="form-input" style="width: 100px" value="<?= $upcharge->upcharge_perc2 ?>">
                        </div>
                        </td>
                        <td class="min-w-[120px]">
                        <button type="button" class="py-2 px-5 tracking-wide border align-middle text-center bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white rounded-md" onclick="updateUpcharge(<?= $upcharge->id ?>)">Update</button>
                        </td>
                    </tr>   
                <?php endforeach; ?>
                </tbody>
                </table>
                    </div>
                </div>
            </div>
        </div>
        <!-- End Content -->
    </div>
</div><!--end container-->

<?= $this->endSection() ?>
<?= $this->section("script") ?>

<script>
    function updateUpcharge(id){
        var upchargePerc1 = $('#upchargePerc1_'+id).val();
        var upchargePerc2 = $('#upchargePerc2_'+id).val();
        $.ajax({
            url: '<?= base_url('update-upcharge') ?>',
            type: 'POST',
            data: {id: id, upcharge_perc1: upchargePerc1, upcharge_perc2: upchargePerc2},
            success: function(response){
                response = JSON.parse(response);
                if(response == 'success'){
                    alert('Upcharge updated successfully');
                }else{
                    alert('Upcharge update failed');
                }
            }
        });
    }
</script>
<?= $this->endSection() ?>