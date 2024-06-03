<!DOCTYPE html>
<html lang="en" class="<?= session()->get('bgcolor') ?> scroll-smooth" dir="ltr">

<head>
    <meta charset="UTF-8">
    <title>Dawson Parcel Rate Tool</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- <meta name="description" content=""> -->
    <!-- <meta name="keywords" content=""> -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <?= $this->include('includes/css.php'); ?>

</head>

<body class="font-nunito text-base text-black dark:text-white dark:bg-slate-900">
    <div class="page-wrapper toggled">
        <!-- sidebar-wrapper -->
        <?= $this->include('partials/admin_sidebar.php'); ?>
        <!-- sidebar-wrapper  -->

        <!-- Start Page Content -->
        <main class="page-content bg-gray-50 dark:bg-slate-800">
            <!-- Top Header -->
            <?= $this->include('includes/header.php'); ?>
            <!-- Top Header -->

            <?= $this->renderSection('body') ?>

            <!--end container-->

            <!-- Footer Start -->
            <?= $this->include('includes/footer.php'); ?>
            <!-- End -->
        </main>
        <!--End page-content" -->
    </div>
    <!-- page-wrapper -->
    <!-- JAVASCRIPTS -->
    <?= $this->include('includes/script.php'); ?>
<script>
var base_url = '<?= base_url() ?>';
    </script>
    <?= $this->renderSection('script'); ?>

    <script>
        //changetheme
        $('#chk').on('change', function() {
                    //change logo
                        if ($('#chk').is(':checked')) {
                                $('.logo').attr('src', 'assets/images/roc-sup-q600x_210x_light.png');
                                // change datatable text font color to white
                                $('.table').addClass('text-white');
                                $('.table-striped>tbody>tr:nth-of-type(odd)').addClass('text-white');
                                
                        } else {
                                $('.logo').attr('src', 'assets/images/roc-sup-q600x_210x.avif');
                                // change datatable text font color to black
                                $('.table').removeClass('text-white');$('.table-striped>tbody>tr:nth-of-type(odd)').removeClass('text-white');
                        }
                        //post request to change theme
                        $.post('<?= base_url('changetheme') ?>', {
                                theme: $('#chk').is(':checked') ? 'dark' : 'light'
                        }, function(data) {
                                if (data == 'success') {
                                location.reload();
                                }
                        });

                });
    </script>
    <!-- JAVASCRIPTS -->
</body>

</html>