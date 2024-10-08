const { encryptPassword } = require("../helpers/helperFunctions");

const messages = {
    "SuccessRetreivingData": "Data successfully retreived.",
    "ErrorRetrievingData": "Something went wrong. Please try again.",
    "UnauthorizedAccessError": "You are not authorized to access. Please contact us at support@mymachineonline.com",
    "UnauthorizedAction": "You are not authorized to perform this action.",
    "ProfileApprovalPending": "Your account is pending admin approval. If you dont't get access with 48 hours, please contact us support@mymachineonline.com",
    "ContactDirector": "You are not authorized to access. Please contact your company director.",
    "VerificationEmail": "We have sent a verification code to your email address",
    "VerificationPhone": "We have sent a verification code to your mobile phone number.",
    "AccountCompleted": "Congratulation, your account has been completed successfully.",
    "LoginInAs": "Logged in as",
    "AddUser": "User has been added successfully.",
    "EmailVerificationSuccess": "Your email has been verified successfully.",
    "PhoneVerificationSucess": "Your mobile phone number has been verified successfully.",
    "EmailExist": "Email address is already associated with an account.",
    "PhoneExist": "Mobile phone number is already associated with an account.",
    "EmailDoesnotExist": "Email address doesn't exist. Please provide a registered email.",
    "PhoneDoesnotExist": "Mobile phone number doesn't exist. Please provide a registered mobile phone number.",
    "EmailPasswordError": "Email & Password does't match.",
    "UsernameEmailAccount": "An account with provided username or email doesn't exist.",
    "UsernameEmailError": "Username or email and password doesn't match.",
    "NoMobileAccount": "An account with provided mobile phone.",
    "MobilePasswordError": "Mobile phone and password doesn't match.",
    "OtpExpired": "Verification code has been expired.",
    "OtpMismatch": "Verification code doesn't match.",
    "CompanyActivated": "has been activated successfully.",
    "CompanyNotApproved": "is not approved yet.",
    "CompanyDeactivated": "has been deactivate successfully.",
    "ForgotPassword": "An email with instructions has been sent to your email address. Follow those instructions to reset your password.",
    "PasswordResetFailed": "Your request does't process. Please try again later.",
    "PasswordResetSuccess": "Your password has been reset successfully.",
    "ProfileUpdated": "Profile updated successfully.",
    "OldNewPasswordSameError": "Current password and new password can't be same.",
    "OldPasswordIncorrect": "Current password is incorrect.",
    "PasswordChangedSuccess": "Password has been changed successfully.",
    "ProfilePicUpdate": "Profile photo updated successfully.",
    "PhotoDeleted": "Photo has been deleted successfully.",
    "RecordAdded": "has been added successfully.",
    "RecordUpdated": "has been updated successfully.",
    "RecordDeleted": "has been deleted successfully.",
    "RecordUploaded": "has been uploaded successfully",
    "RecordRestored": "has been restored successfully.",
    "AlreadyExisted": "already exists.",
    "NoRecordFound": "No record found, please check your search query.",
    "SearchResult": "Search results for query: ",
    "UploadDocumentSuccess": "Document uploaded successfully.",
    "DeleteDocumentSuccess": "Document deleted successfully.",
    "CreditCard": "Credit card has been added successfully.",
    "CreditCardDelete": "Credit card has been deleted successfully.",
    "MachineAdded": "The machine has been successfully added, and it is currently awaiting approval. You will be notified once the approval process is completed.",
    "MachineVerified": "The machine has been verified successfully.",
    "MachineError404": "This machine requires an update to display Transactions data, contact your support representative for more information.",
    "MachineErrorTimeout": "Connection timeout try again later.",
    "MachineAlreadyExists": "Kiosk ID number you entered is already associated with an account. Please check Kiosk ID number.",
    "NoDataToDownload": "There is no data to download.",
    "DownloadSuccess": "has been downloaded successfully.",
    "ProductAdded" : "The product has been successfully added",
    "StudentAdded" : "The student has been successfully added",
}

const adminJson = {
    email: 'ron@rocketamusements.com',
    password: encryptPassword(process.env.SUPER_ADMIN_PASSWORD),
    mobilePhone: '+15125656229',
    firstName: 'Ron',
    lastName: 'Siller',
    role: 'superadmin',
    isActive: true,
    awsDirectory: "Super1557433430123",
    timezone: 'America/New_York'
};

const obj = {
    messages: messages,
    adminJson: adminJson,
    defaultTimezone: 'America/New_York',
    dateFormat: "DD-MMM-YYYY hh:mm a"
};

module.exports = obj;