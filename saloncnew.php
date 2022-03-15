<?php

namespace App\Http\Controllers\Api\Salons;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\General\Facilities;
use App\Models\General\Orders;
use App\Models\General\Services;
use App\Models\Salon\SalonBeauticians;
use App\Models\Salon\SalonFacilities;
use App\Models\Salon\SalonGallery;
use App\Models\Salon\Salons;
use App\Models\Salon\SalonServices;
use App\Models\Salon\SalonBeauticianServices;
use App\Models\Salon\SalonHolidays;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SalonController extends Controller
{
    public function facilities(Request $request)
    {
        DB::beginTransaction();
        try{
            $salon = Salons::where('id', Auth::user()->salon_id)->first();
            if (!empty($salon)) {
                if(!empty($request['facility_id'])) {
                    $salon->Facilities()->sync(explode(',', $request['facility_id']));
                } else {
                    $salon->Facilities()->sync([]);
                }
                DB::commit();
                return response()->json([
                    "status" => 1,
                    "message" => "updated sucessfully",
                ]);
            } else {
                return response()->json([
                    "status" => 0,
                    "message" => "salon not found.",
                ]);
            }
        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                "status" => 0,
                "message" => "Something went wrong.",
            ]);
        }
    }
    public function services(Request $request)
    {
        $servies = $request->all();
        unset($servies['service_type']);
        // dd($servies);
        $serviceType = $request->service_type;
        DB::beginTransaction();
        try{
            $salonAddedServices = SalonServices::with(['serviceDetails'])
            ->where([
                'salons_id' => Auth::user()->salon_id,
            ]);
            $salonAddedServices = $salonAddedServices->whereHas('serviceDetails', function($query) use($serviceType) {
                return $query->where('service_type', $serviceType);
            });

            $salonAddedServices = $salonAddedServices->get()->toArray();
            $salonAddedServices = array_column($salonAddedServices, 'services_id');
            if(!empty($servies)) {
                $salonUpdatedServices = array_column($servies, 'id');
                $salonServicesDiff = array_diff($salonAddedServices, $salonUpdatedServices);
                if(!empty($salonServicesDiff)) {
                    SalonServices::where([
                        'salons_id' => Auth::user()->salon_id
                    ])
                    ->whereIn('services_id', $salonServicesDiff)
                    ->delete();
                }
                foreach ($servies as $key => $service) {
                    $SalonServices = SalonServices::updateOrCreate([
                        'salons_id'   => Auth::user()->salon_id,
                        'services_id'   => $service['id'],
                    ], [
                        'time' => $service['time'],
                        'price' => $service['price'],
                        'description' => $service['description'],
                        'description_ar' => $service['description_ar'],
                        'is_active' => $service['is_active'] == true ? "1" : "0",
                    ]);

                    if(!empty($service['beauticians'])) {
                        $beauticians = explode(',', $service['beauticians']);

                        $salonBeauticianServices = SalonBeauticianServices::where([
                            'salon_id' => Auth::user()->salon_id,
                            'service_id' => $service['id']
                        ])->get()->toArray();

                        if(!empty($salonBeauticianServices)){
                            $selectedBeauticians = array_column($salonBeauticianServices, 'beautician_id');
                            $deletedBeauticians = array_diff($selectedBeauticians, $beauticians);
                            if(!empty($deletedBeauticians)) {
                                foreach($deletedBeauticians as $deletedBeauticianId) {
                                    SalonBeauticianServices::where([
                                        'salon_id' => Auth::user()->salon_id,
                                        'beautician_id' => $deletedBeauticianId,
                                        'service_id' => $service['id']
                                    ])->delete();
                                }
                            }
                        }

                        foreach($beauticians as $beauticianId) {
                            SalonBeauticianServices::updateOrCreate([
                                'salon_id' => Auth::user()->salon_id,
                                'beautician_id' => $beauticianId,
                                'service_id' => $service['id']
                            ],[
                                'salon_id' => Auth::user()->salon_id,
                                'beautician_id' => $beauticianId,
                                'service_id' => $service['id']
                            ]);
                        }
                    } else {
                        SalonBeauticianServices::where([
                            'salon_id' => Auth::user()->salon_id,
                            'service_id' => $service['id']
                        ])->delete();
                    }


                }
            } else {
                // $SalonServices = SalonServices::where(['salons_id' => Auth::user()->salon_id])
                // ->whereIn('services_id', $salonAddedServices)
                // ->delete();
                return response()->json([
                    "status" => 0,
                    "message" => "Something went wrong.",
                ]);
            }
            DB::commit();
            return response()->json([
                "status" => 1,
                "message" => "updated sucessfully",
            ]);
        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                "status" => 0,
                "message" => "Something went wrong.",
            ]);
        }
    }
    public function SalonBeauticians(Request $request)
    {
        if(!isset($request->beautician_id)) {
            $salonbeauticians = new SalonBeauticians();
            $salonbeauticians->salon_id = Auth::user()->salon_id;
            $salonbeauticians->beautician_name_en = $request['beautician_name_en'];
            $salonbeauticians->beautician_name_ar = $request['beautician_name_ar'];
            $salonbeauticians->nationality = $request['nationality'];
            $salonbeauticians->beautician_desc_en = $request['beautician_desc_en'];
            $salonbeauticians->beautician_desc_ar = $request['beautician_desc_ar'];
            if (isset($request->image)) {
                $fileName = time() . '.' . $request->image->extension();
                Storage::disk('beauticianImage')->putFileAs('/', $request->image, $fileName);
                $salonbeauticians->image = $fileName;
            }
            $salonbeauticians->save();

            $beauticianId = $salonbeauticians->id;

            /** Unused code */

            // $services = explode(',', $request['services']);

            // $salonBeauticianServices = SalonBeauticianServices::where([
            //     'salon_id' => Auth::user()->salon_id,
            //     'beautician_id' => $beauticianId
            // ])->get()->toArray();


            // if(!empty($salonBeauticianServices)){
            //     $selectedServices = array_column($salonBeauticianServices, 'service_id');
            //     $deletedServices = array_diff($selectedServices, $services);
            //     if(!empty($deletedServices)) {
            //         foreach($deletedServices as $deletedServiceId) {
            //             SalonBeauticianServices::where([
            //                 'salon_id' => Auth::user()->salon_id,
            //                 'beautician_id' => $beauticianId,
            //                 'service_id' => $deletedServiceId
            //             ])->delete();
            //         }
            //     }
            // }
            // foreach($services as $serviceId) {
            //     SalonBeauticianServices::updateOrCreate([
            //         'salon_id' => Auth::user()->salon_id,
            //         'beautician_id' => $beauticianId,
            //         'service_id' => $serviceId
            //     ],[
            //         'salon_id' => Auth::user()->salon_id,
            //         'beautician_id' => $beauticianId,
            //         'service_id' => $serviceId
            //     ]);
            // }

            /** Unused code */

            return response()->json(["status" => 1, "message" => "Salon Beauticians Created Sucessfully"]);
        } else {
            $data = [
                'beautician_name_en' => $request->beautician_name_en,
                'beautician_name_ar' => $request->beautician_name_ar,
                'nationality' => $request->nationality,
                'beautician_desc_en' => $request->beautician_desc_en,
                'beautician_desc_ar' => $request->beautician_desc_ar,
            ];
            if (isset($request->image)) {
                $fileName = time() . '.' . $request->image->extension();
                Storage::disk('beauticianImage')->putFileAs('/', $request->image, $fileName);
                $data['image'] = $fileName;
            }

            $salonbeauticians = SalonBeauticians::where([
                'salon_id' => Auth::user()->salon_id,
                'id' => $request->beautician_id
            ])->update($data);

            /** Unused code */

            // $beauticianId = $request->beautician_id;
            // $services = explode(',', $request['services']);

            // $salonBeauticianServices = SalonBeauticianServices::where([
            //     'salon_id' => Auth::user()->salon_id,
            //     'beautician_id' => $beauticianId
            // ])->get()->toArray();


            // if(!empty($salonBeauticianServices)){
            //     $selectedServices = array_column($salonBeauticianServices, 'service_id');
            //     $deletedServices = array_diff($selectedServices, $services);
            //     if(!empty($deletedServices)) {
            //         foreach($deletedServices as $deletedServiceId) {
            //             SalonBeauticianServices::where([
            //                 'salon_id' => Auth::user()->salon_id,
            //                 'beautician_id' => $beauticianId,
            //                 'service_id' => $deletedServiceId
            //             ])->delete();
            //         }
            //     }
            // }
            // foreach($services as $serviceId) {
            //     SalonBeauticianServices::updateOrCreate([
            //         'salon_id' => Auth::user()->salon_id,
            //         'beautician_id' => $beauticianId,
            //         'service_id' => $serviceId
            //     ],[
            //         'salon_id' => Auth::user()->salon_id,
            //         'beautician_id' => $beauticianId,
            //         'service_id' => $serviceId
            //     ]);
            // }

            /** Unused code */

            return response()->json(["status" => 1, "message" => "Salon Beauticians updated Sucessfully"]);
        }
    }

    public function deleteSalonBeauticians(Request $request)
    {
        $ordersCount = Orders::with(['orderDetails'])->where('salon_id', Auth::user()->salon_id)->whereIn('status', [1,2,3]);
        $ordersCount = $ordersCount->whereHas('orderDetails', function($query) use($request) {
            return $query->where('beautician_id', $request['id']);
        });
        $ordersCount = $ordersCount->count();

        if($ordersCount > 0) {
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting Salon Beauticians. Beautician has some Accepted/Incompelted orders.'
            ]);
        }
        DB::beginTransaction();
        try {
            $data = SalonBeauticians::where('id', $request['id'])->first();
            $data->delete();
            DB::commit();
            // Storage::disk('facilities_icons')->delete($data->facility_icon);
            return response()->json([
                'status' => 1,
                'message' => 'Salon Beauticians Deleted Sucessfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting Salon Beauticians. Please try again.'
            ]);
        }
    }
    public function detailSalonBeauticians(Request $request)
    {
        $data = SalonBeauticians::where('id', $request['beauticians_id'])->first();
        if (!empty($data)) {
            $data['image'] = !empty($data['image']) ? Storage::disk('beauticianImage')->url($data['image']) : '';
            return response()->json([
                'status' => 1,
                'data' => $data,
                'message' => 'Salon Beauticians Deleted Sucessfully'
            ]);
        } else {
            return response()->json([
                "status" => 0,
                "message" => "Salon Beauticians not found.",
            ]);
        }
    }

    public function SalonGalleries(Request $request)
    {
        DB::beginTransaction();
        try {
            $time = time();
            foreach ($request['image'] as $key => $image) {
                $SalonGallery = new SalonGallery();
                $SalonGallery->salon_id  = Auth::user()->salon_id;
                $fileName = ($time + $key) . '.' . $image->extension();

                Storage::disk('salonGallery')->putFileAs('/', $image, $fileName);
                $SalonGallery->image = $fileName;
                $SalonGallery->save();
            }
            DB::commit();
            return response()->json(["status" => 1, "message" => "Salon Galleries Created Sucessfully"]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(["status" => 0, "message" => 'Something wents wrong,try again later']);
        }
    }

    public function deleteSalonGalleries(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = SalonGallery::where('id', $request['id'])->first();
            $data->delete();
            DB::commit();
            // Storage::disk('facilities_icons')->delete($data->facility_icon);
            return response()->json([
                'status' => 1,
                'message' => 'Salon Galleries Deleted Sucessfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting Salon Galleries. Please try again.'
            ]);
        }
    }

public function details(Request $request)
    {
        // dd($request->user()->salon_id);
        $facilities = Facilities::get()->toArray();
        $services = Services::with([
            'parentService',
            'salonServiceConfig' => function($query) use($request) {
                return $query->where('salons_id', $request->user()->salon_id);
            },
            'serviceBeauticians' => function($query) use($request) {
                return $query->where('salon_id', $request->user()->salon_id);
            },
        ])
        ->where('parent', '>', 0)
        ->get()
        ->toArray();
        

        $salon = Salons::with([
            'salonGallery',
            'salonBeauticians.country',
            'salonFacilities' => function($query) use($request) {
                return $query->where('salons_id', $request->user()->salon_id);
            },
            'salonServices' => function($query) use($request) {
                return $query->where('salons_id', $request->user()->salon_id)->with(['serviceDetails']);
            },
            'salonDetails' => function ($query) {
                $query->with(['salonRegion.governorate']);
            },
            'salonHolidays',
            'salonCoupons' => function($query) {
                $query->with(['couponDetails']);
            }
        ])
            ->where('user_id', $request->user()->id)
            ->first();
        if (!empty($salon)) {
            $result = [];
            $salon =  $salon->toArray();
            $result['id'] = $salon['id'];
            $result['salon_name'] = $salon['salon_name'];
            $result['commerical_id'] = $salon['commerical_id'];
            $result['average_rating'] = $salon['average_rating'];
            $result['is_favorite'] = $salon['is_favorite'];
            $result['holidays'] = !empty($salon['salon_holidays']) ? $salon['salon_holidays']['holiday'] : '';
            $result['coupons'] = [];
            if(!empty($salon['salon_coupons'])) {
                foreach ($salon['salon_coupons'] as $coupon) {
                    $data = [];
                    $data['coupon_id'] = $coupon['coupon_id'];
                    $data['coupon_code'] = $coupon['coupon_details']['coupon_code'];
                    $data['amount'] = $coupon['coupon_details']['amount'];

                    array_push($result['coupons'], $data);
                }
            }

            $result['logo_image'] = Storage::disk('salon_logo')->url($salon['salon_details']['logo_image']);
            $result['cover_image'] = Storage::disk('salon_cover')->url($salon['salon_details']['cover_image']);
            $result['cover_image2'] = Storage::disk('salon_cover')->url($salon['salon_details']['cover_image2']);

            foreach ($salon['salon_gallery'] as $galleryKey => $galleryImage) {
                $salon['salon_gallery'][$galleryKey]['salon_id']=$salon['id'];
                $salon['salon_gallery'][$galleryKey]['image'] = Storage::disk('salonGallery')->url($galleryImage['image']);
            }
            $result['gallery'] = $salon['salon_gallery'];
            $salonBeauticians = [];
            if (!empty($salon['salon_beauticians'])) {
                foreach ($salon['salon_beauticians'] as $beauticianKey => $beauticians) {
                    $salonBeauticians[$beauticianKey]['id'] = $beauticians['id'];
                    $salonBeauticians[$beauticianKey]['salon_id'] = (int)$beauticians['salon_id'];
                    $salonBeauticians[$beauticianKey]['beautician_name'] = $beauticians['name'];
                    $salonBeauticians[$beauticianKey]['beautician_image'] = !empty($beauticians['image']) ? Storage::disk('beauticianImage')->url($beauticians['image']) : '';
                    $salonBeauticians[$beauticianKey]['nationality_id'] = $beauticians['country']['country_id'];
                    $salonBeauticians[$beauticianKey]['nationality'] = $beauticians['country']['country_name'];
                    $salonBeauticians[$beauticianKey]['beautician_desc'] = $beauticians['description'];
                }
                $result['beauticians'] = $salonBeauticians;
            } else {
                $result['beauticians'] = [];
            }

            $result['location']['location_lat'] = $salon['salon_details']['location_lat'];
            $result['location']['location_lang'] = $salon['salon_details']['location_lang'];
            $result['location']['governorate_id'] = $salon['salon_details']['salon_region']['governorate']['id'];
            $result['location']['governorate_name'] = $salon['salon_details']['salon_region']['governorate']['name'];

            $result['location']['region']['region_id'] = $salon['salon_details']['salon_region']['id'];
            $result['location']['region']['region'] = $salon['salon_details']['salon_region']['name'];
            $result['open_time'] = $salon['salon_details']['open_time'];
            $result['close_time'] = $salon['salon_details']['close_time'];

            $salonFacilities = [];
            $salonAddedFacilities = array_column($salon['salon_facilities'], 'facilities_id');
            if (!empty($facilities)) {
                foreach ($facilities as $facilityKey => $facility) {
                    $salonFacilities[$facilityKey]['id'] = $facility['id'];
                    $salonFacilities[$facilityKey]['facility_name'] = $facility['name'];
                    $salonFacilities[$facilityKey]['facility_icon'] = Storage::disk('facilities_icons')->url($facility['facility_icon']);
                    $salonFacilities[$facilityKey]['is_salon_facility'] = false;

                    if (in_array($facility['id'], $salonAddedFacilities)) {
                        $salonFacilities[$facilityKey]['is_salon_facility'] = true;
                    }
                }
                $result['facilities'] = $salonFacilities;
            } else {
                $result['facilities'] = [];
            }

            $salonServices = [];
            $homeServices = [];
            $salonAddedServices = array_column($salon['salon_services'], 'services_id');
            $salonDeletedBeauticians = SalonBeauticians::where('salon_id', $salon['id'])->onlyTrashed()->get()->pluck('id')->toArray();
            if (!empty($services)) {
                foreach ($services as $serviceKey => $service) {
                    $parentService = $service['parent'];
                    if ($service['service_type'] == '0') {
                        if (in_array($service['id'], $salonAddedServices)) {
                            $salonServices[$parentService]['id'] = $service['parent_service']['id'];
                            $salonServices[$parentService]['service_name'] = $service['parent_service']['service_name'];

                            $salonServices[$parentService]['child_services'][$serviceKey]['id'] = $service['id'];
                            $salonServices[$parentService]['child_services'][$serviceKey]['service_name'] = $service['service_name'];
                            $salonServices[$parentService]['child_services'][$serviceKey]['service_desc_en'] = !empty($service['salon_service_config']) ? $service['salon_service_config']['description'] : '';
                            $salonServices[$parentService]['child_services'][$serviceKey]['service_desc_ar'] = !empty($service['salon_service_config']) ? $service['salon_service_config']['description_ar'] : '';
                            $salonServices[$parentService]['child_services'][$serviceKey]['time'] = !empty($service['salon_service_config']) && !is_null($service['salon_service_config']['time']) ? (int)$service['salon_service_config']['time'] : 0;
                            $salonServices[$parentService]['child_services'][$serviceKey]['price'] = !empty($service['salon_service_config']) && !is_null($service['salon_service_config']['price']) ? $service['salon_service_config']['price'] : 0;
                            $salonServices[$parentService]['child_services'][$serviceKey]['service_type'] = $service['service_type'];
                            $salonServices[$parentService]['child_services'][$serviceKey]['is_active'] = $service['salon_service_config']['is_active'] == 1 ? true : false;

                            $salonServices[$parentService]['child_services'][$serviceKey]['is_salon_service'] = true;
                            $salonServices[$parentService]['child_services'][$serviceKey]['beauticians'] = '';
                            if(!empty($service['service_beauticians'])) {
                                $service_beauticians = array_column($service['service_beauticians'], 'beautician_id');
                                $beauticians = array_diff($service_beauticians, $salonDeletedBeauticians);
                                $salonServices[$parentService]['child_services'][$serviceKey]['beauticians'] = implode(',', $beauticians);
                            }
                            $salonServices[$parentService]['child_services'] = array_values($salonServices[$parentService]['child_services']);
                        }

                    } else if ($service['service_type'] == '1') {
                        if (in_array($service['id'], $salonAddedServices)) {
                            $homeServices[$parentService]['id'] = $service['parent_service']['id'];
                            $homeServices[$parentService]['service_name'] = $service['parent_service']['service_name'];

                            $homeServices[$parentService]['child_services'][$serviceKey]['id'] = $service['id'];
                            $homeServices[$parentService]['child_services'][$serviceKey]['service_name'] = $service['service_name'];
                            $homeServices[$parentService]['child_services'][$serviceKey]['service_desc_en'] = !empty($service['salon_service_config']) ? $service['salon_service_config']['description'] : '';
                            $homeServices[$parentService]['child_services'][$serviceKey]['service_desc_ar'] = !empty($service['salon_service_config']) ? $service['salon_service_config']['description_ar'] : '';
                            $homeServices[$parentService]['child_services'][$serviceKey]['time'] = !empty($service['salon_service_config']) && !is_null($service['salon_service_config']['time']) ? (int)$service['salon_service_config']['time'] : 0;
                            $homeServices[$parentService]['child_services'][$serviceKey]['price'] = !empty($service['salon_service_config']) && !is_null($service['salon_service_config']['price']) ? $service['salon_service_config']['price'] : 0;
                            $homeServices[$parentService]['child_services'][$serviceKey]['service_type'] = $service['service_type'];
                            $homeServices[$parentService]['child_services'][$serviceKey]['is_active'] = $service['salon_service_config']['is_active'] == 1 ? true : false;

                            $homeServices[$parentService]['child_services'][$serviceKey]['is_salon_service'] = true;
                            $homeServices[$parentService]['child_services'][$serviceKey]['beauticians'] = '';
                            if(!empty($service['service_beauticians'])) {
                                $service_beauticians = array_column($service['service_beauticians'], 'beautician_id');
                                $beauticians = array_diff($service_beauticians, $salonDeletedBeauticians);
                                $homeServices[$parentService]['child_services'][$serviceKey]['beauticians'] = implode(',', $beauticians);
                            }
                            $homeServices[$parentService]['child_services'] = array_values($homeServices[$parentService]['child_services']);
                        }

                    }
                }
                $result['services'] = array_values($salonServices);
                $result['home_services'] = array_values($homeServices);
            } else {
                $result['services'] = [];
                $result['home_services'] = [];
            }

            return response()->json([
                "status" => 1,
                "message" => "Salons found.",
                "data" => $result
            ]);
        } else {
            return response()->json([
                "status" => 0,
                "message" => "Salons not found.",
            ]);
        }
    }

    public function servicesList(Request $request) {
        $salonServices = SalonServices::with('serviceDetails')->where([
            'salons_id' => Auth::user()->salon_id
        ])->whereHas('serviceDetails', function($query) {
            return $query->where('parent', '!=', 0);
        });

        if(isset($request->service_type)) {
            $salonServices = $salonServices->whereHas('serviceDetails', function($query) use($request) {
                return $query->where('service_type', $request->service_type);
            });
        }
        $salonServices = $salonServices->get()
        ->toArray();

        if(!empty($salonServices)) {
            $response = [];
            foreach($salonServices as $key => $salonService) {
                $response[$key]['service_id'] = $salonService['service_details']['id'];
                $response[$key]['service_name'] = $salonService['service_details']['service_name'];
                $response[$key]['service_type'] = $salonService['service_details']['service_type'];
                $response[$key]['service_desc'] = $salonService['description'];
                $response[$key]['service_desc_ar'] = $salonService['description_ar'];
            }
            return response()->json([
                'status' => 1,
                'message' => 'Services found.',
                'data' => $response
            ]);
        } else {
            return response()->json([
                'status' => 0,
                'message' => 'No services found for this salon.'
            ]);
        }
    }

    public function addHoliday(Request $request) {
        $holidays = $request->holidays;
        if(!empty($holidays)) {
            $holidaysArr = explode(',', $holidays);

            $ordersCount = Orders::where('salon_id', Auth::user()->salon_id)
            ->whereIn('booking_date', $holidaysArr)
            ->whereIn('status', [2,3])
            ->get()
            ->count();

            if($ordersCount > 0) {
                return response()->json([
                    "status" => 0,
                    "message" => "You have active orders. Can't add holiday.",
                ]);
            }

            DB::beginTransaction();
            try{
                foreach($holidaysArr as $holiday) {
                    SalonHolidays::create([
                        'salon_id' => Auth::user()->salon_id,
                        'holiday' => $holiday
                    ]);
                }
                DB::commit();
                return response()->json([
                    "status" => 1,
                    "message" => "Holidays added for salon.",
                ]);
            } catch (Exception $e) {
                DB::rollback();
                return response()->json([
                    "status" => 0,
                    "message" => "Something went wrong.",
                ]);
            }
        } else {
            return response()->json([
                "status" => 0,
                "message" => "Something went wrong.",
            ]);
        }
    }

    public function removeHoliday(Request $request) {
        $holidayCount = SalonHolidays::where([
            'salon_id' => Auth::user()->salon_id,
            'holiday' => $request->holiday
        ])->count();
        DB::beginTransaction();
        if($holidayCount > 0 && $request->holiday > date('Y-m-d')) {
            try{
                SalonHolidays::where([
                    'salon_id' => Auth::user()->salon_id,
                    'holiday' => $request->holiday
                ])->delete();

                DB::commit();
                return response()->json([
                    "status" => 1,
                    "message" => "Holiday removed for salon.",
                ]);
            } catch (Exception $e) {
                DB::rollback();
                return response()->json([
                    "status" => 0,
                    "message" => "Something went wrong.",
                ]);
            }
        } else {
            return response()->json([
                "status" => 0,
                "message" => "Cannot delete past holiday.",
            ]);
        }
    }

    public function salonHolidays(Request $request) {
        // if(!empty($request->holidays)) {
            DB::beginTransaction();
            try{
                SalonHolidays::updateOrCreate([
                    'salon_id' => Auth::user()->salon_id,
                ],[
                    'salon_id' => Auth::user()->salon_id,
                    'holiday' => $request->holidays
                ]);
                DB::commit();
                return response()->json([
                    "status" => 1,
                    "message" => "Success.",
                ]);
            } catch (Exception $e) {
                DB::rollback();
                return response()->json([
                    "status" => 0,
                    "message" => "Something went wrong.",
                ]);
            }
        // } else {
        //     return response()->json([
        //         "status" => 0,
        //         "message" => "Something went wrong.",
        //     ]);
        // }
    }
}
