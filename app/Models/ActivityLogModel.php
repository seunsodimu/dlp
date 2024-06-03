<?php

namespace App\Models;

use CodeIgniter\Model;

class ActivityLogModel extends Model
{
    protected $table = 'user_activity_logs';
    protected $allowedFields = ['user_id', 'activity_type', 'activity_desc', 'ip_address', 'user_agent'];

    public function logActivity($data)
    {
        $this->insert($data);
    }

    public function getActivities($userId)
    {
        return $this->where('user_id', $userId)->orderBy('created_at', 'desc')->findAll();
    }
}
