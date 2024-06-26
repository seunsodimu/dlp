<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\OrderModel;
use App\Models\RentalsModel;
use App\Models\PaymentsModel;
use App\Models\ActivityLogModel;
use CodeIgniter\Controller;
use Exception;
require_once '../vendor/autoload.php';

class UserController extends BaseController
{
    protected $userModel;
    public $data = [
        'page_title' => ['title' => 'Member Dashboard'],
        'meta_tags' => [
            'tags'=>[
                [
                'enabled' => true,
                'description' => 'Members',
                'content' => 'members',
                'robots' => 'noindex, nofollow',
                'type' => 'name',
                'type_value' => 'description',
            ]
            ]
        ],
        'page_top_promo' => ['enabled' => false],
        'active' => 'cart'
    ];
    public $sendmail;
    public $sendgrid;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->sendmail = new \SendGrid\Mail\Mail();
        $this->sendgrid = new \SendGrid(getenv('SENDGRID_API_KEY'));
    }

    public function index()
    {
        $this->data['active'] = 'login';
        if (session()->get('isLoggedIn')) {
            return redirect()->to('dashboard');
        } else {
            $this->data['page_title']['title'] = 'Admin Login';
            return view('login', ['data' => $this->data]);
        }
    }

    public function login()
    {
        $this->data['active'] = 'login';
        if (session()->get('isLoggedIn')) {
            return redirect()->to('dashboard');
        }
        $rules = [
            'username' => 'required',
            'password' => 'required|min_length[8]'
        ];

        if (!$this->validate($rules)) {
            session()->setFlashdata('validation', $this->validator);
            return view('login', ['data' => $this->data]);
        } else {
            $model = $this->userModel;
            $user = $model->where('username', $this->request->getVar('username'))->first();

            if ($user) {
                if ($user['status'] == 0) {
                    session()->setFlashdata('msg', 'Your email address has not been verified! Please check your email for the verification link or <a href="#" class="showreset">click here</a> to resend the verification email.');
                    session()->setFlashdata('msgtype', 'danger');
                    return view('login', ['data' => $this->data]);
                }
                if (password_verify($this->request->getVar('password'), $user['password'])) {
                    $this->setUserSession($user);
                    $redirect_url = session()->get('redirect_url') ?? site_url('dashboard');
                    session()->remove('redirect_url');
                    return redirect()->to($redirect_url);
                } else {
                session()->setFlashdata('msg', 'Incorrect password!');
                session()->setFlashdata('msgtype', 'danger');
                return view('login', ['data' => $this->data]);
                }
            } else {
                session()->setFlashdata('msg', 'Username not found!');
                session()->setFlashdata('msgtype', 'danger');
                return view('login', ['data' => $this->data]);
            }
        }
    }

    private function setUserSession($user)
    {
        $data = [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'firstname' => $user['first_name'],
            'isLoggedIn' => true,
        ];

        session()->set($data);
       //  var_dump(session()->get('isLoggedIn')); exit;
        return true;
    }

    public function verify()
    {
        $this->data['active'] = 'login';
        $email = $this->request->getVar('email');
        $code = $this->request->getVar('cde');
        $model = $this->userModel;
        $verification = $model->getVerificationCode($code);
        if ($verification) {
            if ($verification->used == 0 && $verification->expires_at > date('Y-m-d H:i:s')) {
                $data = [
                    'status' => 1,
                ];
                $model->update($verification->user_id, $data);
                $data = [
                    'used' => 1,
                ];
                $model->updateVerificationCode($verification->id, $data);
                session()->setFlashdata('msg', 'Your email has been verified. You can now login.');
                session()->setFlashdata('msgtype', 'success');
                return view('login', ['data' => $this->data]);
            } else {
                session()->setFlashdata('msg', 'Verification code expired or already used, please <a href="' . base_url() . 'login?reset=1&email=' . $email . '">click here</a> to resend the verification email.');
                session()->setFlashdata('msgtype', 'danger');
                return view('login', ['data' => $this->data]);
            }
        } else {
            session()->setFlashdata('msg', 'Invalid verification code, please <a href="' . base_url() . 'login?reset=1&email=' . $email . '">click here</a> to resend the verification email.');
            session()->setFlashdata('msgtype', 'danger');
            return view('login', ['data' => $this->data]);
        }
       
    }

    public function resetPassword()
    {
        $this->data['active'] = 'login';
        $email = $this->request->getVar('EmailAddress');
        $model = $this->userModel;
        $user = $model->getUserByEmail($email);
        if ($user) {
            $verification_code = bin2hex(random_bytes(16));
            $verification_data = [
                'user_id' => $user['id'],
                'code' => $verification_code,
                'purpose' => 'password_reset', 
                'expires_at' => date('Y-m-d H:i:s', strtotime('+24 hours')),
                'used' => 0
            ];
            $model->saveVerificationCode($verification_data);
            $verificationlink = base_url() . 'member-reset-password?email=' . $email . '&cde=' . $verification_code;
            // Send verification email
            $this->sendmail->setFrom('no-reply@rocoutdoorsrentals.com', 'ROC Outdoors Rentals');
            $this->sendmail->setSubject('Reset Password');
            $this->sendmail->addTo($email);
            $this->sendmail->addContent("text/html", 'Hi ' . $user['first_name'] . ',<br><br>Click on this link to reset your password: <a href="' . $verificationlink . '">Reset Password</a><br><br>Thank you,<br>ROC Outdoors Rentals');
            $this->sendmail->addContent("text/plain", 'Hi ' . $user['first_name'] . ',\n\nClick on this link to reset your password: ' . $verificationlink . '\n\nThank you,\nROC Outdoors Rentals');
            if ($this->sendgrid->send($this->sendmail)->statusCode() == 202) {
                session()->setFlashdata('msg', 'Password reset link has been sent to your email address');
                session()->setFlashdata('msgtype', 'success');
                return view('login', ['data' => $this->data]);
            } else {
                session()->setFlashdata('msg', 'Failed to send password reset email');
                session()->setFlashdata('msgtype', 'danger');
                return view('login', ['data' => $this->data]);
            }
        } else {
            session()->setFlashdata('msg', 'Email address not found');
            session()->setFlashdata('msgtype', 'danger');
            return view('login', ['data' => $this->data]);
        }
    }
    public function logout()
    {
        $this->data['active'] = 'login';
        session()->destroy();
        return redirect()->to('/login');
    }


    public function profileUpdate()
    {
        
        $rules = [
            'FirstName' => 'required',
            'LastName' => 'required',
            'Email' => 'required|valid_email',
        ];

        if (!$this->validate($rules)) {
            return json_encode(['status' => 'error', 'msg' => $this->validator->listErrors()]);
        } else {
            $model = $this->userModel;
            $data = [
                'first_name' => $this->request->getVar('FirstName'),
                'last_name' => $this->request->getVar('LastName'),
                'email' => $this->request->getVar('Email'),
                'phone' => $this->request->getVar('Phone') ?? '',
                'address' => $this->request->getVar('Address') ?? '',
                'city' => $this->request->getVar('City') ?? '',
                'state' => $this->request->getVar('State') ?? '',
                'zip' => $this->request->getVar('Zip') ?? '',
                'timezone' => $this->request->getVar('Timezone') ?? 'America/New_York',
            ];
            $model->update(session()->get('user_id'), $data);
            return json_encode(['status' => 'success', 'msg' => 'Profile updated successfully']);
        }
    }    
    
    public function changePassword()
    {
        $this->data['active'] = 'dashboard';
        $rules = [
            'CurrentPassword' => 'required',
            'NewPassword' => 'required|min_length[8]',
            'ConfirmPassword' => 'matches[NewPassword]'
        ];

        if (!$this->validate($rules)) {
            return json_encode(['status' => 'errorlist', 'msg' => $this->validator->listErrors()]);
        } else {
            $model = $this->userModel;
            $user = $model->getUser(session()->get('user_id'));
            if (password_verify($this->request->getVar('CurrentPassword'), $user['password'])) {
                $data = [
                    'password' => password_hash($this->request->getVar('NewPassword'), PASSWORD_DEFAULT),
                ];
                $model->update(session()->get('user_id'), $data);
                return json_encode(['status' => 'success', 'msg' => 'Password updated successfully']);
            } else {
                return json_encode(['status' => 'error', 'msg' => 'Incorrect current password']);
            }
        }
    }

    public function customer($id)
    {
        $model = new UserModel();
        $activity = new ActivityLogModel();
        $customer = $model->getUser($id);
        $customer_created = new \DateTime($customer['created_at']);
        $member_for = $customer_created->diff(new \DateTime());
        $member_for = $member_for->format('%y years, %m months, %d days');
        $data = [
            'page_title' => $customer['first_name'] . ' ' . $customer['last_name'],
            'customer' => $customer,
            'member_for' => $member_for,
            'activities' => $activity->getActivities($id),
            'active' => 'customers'
        ];
        return view('customer', $data);
    }

}