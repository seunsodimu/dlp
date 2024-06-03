<!DOCTYPE html>
<html lang="en" class="light scroll-smooth" dir="ltr">
    <head>
        <meta charset="UTF-8">
        <title>Dawson Logistics | ParcelRate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <!-- favicon -->
        <link rel="shortcut icon" href="<?= base_url() ?>assets/images/favicon.ico">

        <!-- Css -->
        <!-- Main Css -->
        <link href="<?= base_url() ?>assets/libs/simplebar/simplebar.min.css" rel="stylesheet">
        <link href="<?= base_url() ?>assets/libs/@iconscout/unicons/css/line.css" type="text/css" rel="stylesheet">
        <link href="<?= base_url() ?>assets/libs/@mdi/font/css/materialdesignicons.min.css" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="<?= base_url() ?>assets/css/tailwind.css">

    </head>
    
    <body class="font-nunito text-base text-light dark:text-white dark:bg-slate-900">
       <!-- Start -->
        <section class="relative overflow-hidden">
            <div class="absolute inset-0 bg-indigo-600/[0.02]"></div>
            <div class="container-fluid relative">
                <div class="md:flex items-center">
                    <div class="xl:w-[60%] lg:w-1/3 md:w-1/2">
                        <div class="relative md:flex flex-col md:min-h-screen justify-center bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 md:px-10 py-10 px-4 z-1">
                            <div class="text-center">
                                <a href="#"><img src="<?= base_url() ?>assets/images/logo-dark.png" id="logo" class="mx-auto" alt=""></a>
                            </div>
                            <div class="title-heading text-center md:my-auto my-20">
                                <div class="login_messages">
                                    <?php if(session()->getFlashdata('msgtype')=="danger"): ?>
                                        <div class="relative px-4 py-2 rounded-md font-medium bg-red-600/10 border border-red-600/10 text-red-600 block"><?= session()->getFlashdata('msg') ?></div>
                                    <?php endif; ?>
                                </div>
                                <form class="text-start" action="<?= base_url('login') ?>" method="post">
                                    <div class="grid grid-cols-1">
                                        <div class="mb-4">
                                            <label class="font-semibold" for="LoginEmail">Email Address:</label>
                                            <input name="username" id="LoginEmail" type="email" class="form-input mt-3 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-indigo-600 dark:border-gray-800 dark:focus:border-indigo-600 focus:ring-0" placeholder="name@example.com">
                                        </div>
        
                                        <div class="mb-4">
                                            <label class="font-semibold" for="LoginPassword">Password:</label>
                                            <input name="password" id="LoginPassword" type="password" class="form-input mt-3 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-indigo-600 dark:border-gray-800 dark:focus:border-indigo-600 focus:ring-0" placeholder="Password:">
                                        </div>
        
                                        <div class="flex justify-between mb-4">
                                            <div class="flex items-center mb-0">
                                                <input class="form-checkbox rounded border-gray-200 dark:border-gray-800 text-indigo-600 focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 me-2" type="checkbox" value="" id="RememberMe">
                                                <label class="form-checkbox-label text-slate-400" for="RememberMe">Remember me</label>
                                            </div>
                                            <p class="text-slate-400 mb-0"><a href="auth-re-password.html" class="text-slate-400">Forgot password ?</a></p>
                                        </div>
        
                                        <div class="mb-4">
                                            <input type="submit" class="py-2 px-5 inline-block tracking-wide border align-middle duration-500 text-base text-center bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 text-white rounded-md w-full" value="Login / Sign in">
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="text-center">
                                <p class="mb-0 text-slate-400">© <script>document.write(new Date().getFullYear())</script> Dawson Logistics.
                                <br><br> Developed and managed by <i class="mdi mdi-heart text-red-600"></i> by <a href="https://manzant.com/" target="_blank" class="text-reset">Manzant Systems</a>.</p>
                            </div>
                        </div>
                    </div>

                    <div class="xl:w-[40%] lg:w-2/3 md:w-1/2 flex justify-center mx-6 md:my-auto">
                        <div>
                            <div class="relative">
                                <div class="absolute top-20 start-20 bg-indigo-600/[0.02] h-[1200px] w-[1200px] rounded-full"></div>
                                <div class="absolute bottom-20 -end-20 bg-indigo-600/[0.02] h-[600px] w-[600px] rounded-full"></div>
                            </div>
    
                            <div class="text-center">
                                <div>
                                    <img id="login-img" src="<?= base_url() ?>assets/images/utility.jpg" class="max-w-xl mx-auto" alt="">
                                    <div class="relative max-w-xl mx-auto text-start">
                                        
            
                                       
                                    </div>
                                    <!-- <p class="text-slate-400 max-w-xl mx-auto">Start working with Tailwind CSS that can provide everything you need to generate awareness, drive traffic, connect. Dummy text is text that is used in the publishing industry or by web designers to occupy the space which will later be filled with 'real' content.</p> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div><!--end container-->
        </section><!--end section -->
        <!-- End -->

        <div class="fixed bottom-3 end-3">
            <a href="" class="back-button h-9 w-9 inline-flex items-center justify-center tracking-wide border align-middle duration-500 text-base text-center bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 text-white rounded-full"><i data-feather="arrow-left" class="h-4 w-4"></i></a>
        </div>

        <!-- Switcher -->
        <div class="fixed top-[30%] -end-3 z-50">
            <span class="relative inline-block rotate-90">
                <input type="checkbox" class="checkbox opacity-0 absolute" id="chk" />
                <label class="label bg-slate-900 dark:bg-white shadow dark:shadow-gray-700 cursor-pointer rounded-full flex justify-between items-center p-1 w-14 h-8" for="chk">
                    <i class="uil uil-moon text-[20px] text-yellow-500"></i>
                    <i class="uil uil-sun text-[20px] text-yellow-500"></i>
                    <span class="ball bg-white dark:bg-slate-900 rounded-full absolute top-[2px] left-[2px] w-7 h-7"></span>
                </label>
            </span>
        </div>
        <!-- Switcher -->

        <!-- JAVASCRIPTS -->
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
        <script src="<?= base_url() ?>assets/libs/feather-icons/feather.min.js"></script>
        <script src="<?= base_url() ?>assets/libs/simplebar/simplebar.min.js"></script>
        <script src="<?= base_url() ?>assets/js/plugins.init.js"></script>
        <script src="<?= base_url() ?>assets/js/app.js"></script>
        <!-- JAVASCRIPTS -->
        <script>
            $(document).ready(function() {
  

$('#chk').on('change', function() {
    if ($('#chk').is(':checked')) {
        $('#logo').attr('src', 'assets/images/logo-dark.png');
    } else {
        $('#logo').attr('src', 'assets/images/logo-dark.png');
    }

});
            });




            </script>
    </body>
</html>