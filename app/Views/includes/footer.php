<!-- Switcher -->
<div class="fixed top-[30%] -end-3 z-50">
    <span class="relative inline-block rotate-90">
        <input type="checkbox" class="checkbox opacity-0 absolute" id="chk" <?= session()->get('bgcolor') == 'dark' ? 'checked' : '' ?> />
        <label
            class="label bg-slate-900 dark:bg-white shadow dark:shadow-gray-700 cursor-pointer rounded-full flex justify-between items-center p-1 w-14 h-8"
            for="chk">
            <i class="uil uil-moon text-[20px] text-yellow-500"></i>
            <i class="uil uil-sun text-[20px] text-yellow-500"></i>
            <span class="ball bg-white dark:bg-slate-900 rounded-full absolute top-[2px] left-[2px] w-7 h-7"></span>
        </label>
    </span>
</div>
<!-- Switcher -->
<footer class="shadow dark:shadow-gray-700 bg-white dark:bg-slate-900 px-6 py-4">
    <div class="container-fluid">
        <div class="grid grid-cols-1">
            <div class="sm:text-start text-center mx-md-2">
                <p class="mb-0 text-slate-400">©
                    <script>document.write(new Date().getFullYear())</script> Dawson Logistics. Developed by <a
                        href="https://www.manzant.com" target="_blank" class="text-reset">Manzant Systems</a>.
                </p>
            </div><!--end col-->
        </div><!--end grid-->
    </div><!--end container-->
</footer><!--end footer-->