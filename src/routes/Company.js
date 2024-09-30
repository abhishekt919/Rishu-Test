const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const CompanyCtrl = require("../controllers/Company");

router.get("/get/:companyId", checkAuth, CompanyCtrl.GetCompanyById);
router.patch("/update", checkAuth, CompanyCtrl.UpdateCompanyById);
router.post("/delete", checkAuth, CompanyCtrl.DeleteCompanyById);
router.get("/affiliated/:companyId", checkAuth, CompanyCtrl.GetAffiliatedCompanyList);
router.get("/list-affiliated/:companyId/:page/:perPage", checkAuth, CompanyCtrl.GetAffiliatedCompanies);
router.get("/affiliated-and-my/:companyId", checkAuth, CompanyCtrl.GetAffiliatedCompanyAndMy);
// Super Admin
router.get("/list/:page/:perPage", checkAuth, CompanyCtrl.GetCompanyList);
router.get("/list-all", checkAuth, CompanyCtrl.GetAllCompanyList);
router.get("/get-count", checkAuth, CompanyCtrl.GetCompanyCount);
router.post("/approve-company", checkAuth, CompanyCtrl.ApproveCompany);
router.post("/get-details", checkAuth, CompanyCtrl.GetCompanyDetails);
router.patch("/update-settings", checkAuth, CompanyCtrl.UpdateCompanySettings);
router.post("/super-admin-login", checkAuth, CompanyCtrl.SuperAdminLogin);
router.post("/switch-to-super-admin", checkAuth, CompanyCtrl.SwitchToSuperAdmin);

module.exports = router;