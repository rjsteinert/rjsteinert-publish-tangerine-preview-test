const archiveToDiskConfig = async (req, res)=>{
    try {
        const {T_ARCHIVE_PWAS_TO_DISK, T_ARCHIVE_APKS_TO_DISK} = process.env
        res.send({ statusCode: 200, T_ARCHIVE_APKS_TO_DISK, T_ARCHIVE_PWAS_TO_DISK });
    } catch (error) {
        console.error()
        res.sendStatus(500)
    }
}

const passwordPolicyConfig = async (req, res)=>{
  try {
    const {T_PASSWORD_POLICY, T_PASSWORD_RECIPE} = process.env
    res.send({ statusCode: 200, T_PASSWORD_POLICY, T_PASSWORD_RECIPE });
  } catch (error) {
    console.error()
    res.sendStatus(500)
  }
}

module.exports = {
    archiveToDiskConfig,
    passwordPolicyConfig
}