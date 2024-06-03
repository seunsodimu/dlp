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
    <?= $this->renderSection('body') ?>
    <!-- page-wrapper -->
    <!-- JAVASCRIPTS -->
    <?= $this->include('includes/script.php'); ?>
<script>
var base_url = '<?= base_url() ?>';
    </script>
    <?= $this->renderSection('script'); ?>

    <script>
     
    </script>
    <!-- JAVASCRIPTS -->
</body>

</html>