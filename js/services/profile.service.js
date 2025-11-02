/**
 * FLUXI - Profile Service
 * Handles user profile operations including avatar upload
 */

/**
 * Upload user avatar to Supabase Storage
 * @param {File} file - Image file to upload
 * @returns {Object} Result with success status and avatar URL or error message
 */
async function uploadAvatar(file) {
  try {
    // Validate file
    if (!file) {
      return { success: false, message: 'Nenhum arquivo selecionado' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, message: 'O arquivo deve ser uma imagem' }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return { success: false, message: 'A imagem deve ter no máximo 5MB' }
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: 'Usuário não autenticado' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        message: uploadError.message || 'Erro ao fazer upload da imagem'
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return {
        success: false,
        message: 'Erro ao atualizar perfil com nova foto'
      }
    }

    // Clear cache
    if (typeof clearCache === 'function') {
      clearCache('user_profile')
    }

    return {
      success: true,
      message: 'Foto atualizada com sucesso!',
      avatarUrl: publicUrl
    }
  } catch (error) {
    console.error('Upload avatar error:', error)
    return {
      success: false,
      message: 'Erro inesperado ao fazer upload da foto'
    }
  }
}

/**
 * Get user profile including avatar
 * @returns {Object} Result with user profile data
 */
async function getUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: 'Usuário não autenticado' }
    }

    // Check cache first
    if (typeof getCache === 'function') {
      const cached = getCache('user_profile')
      if (cached) {
        return { success: true, data: cached }
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Get profile error:', error)
      return { success: false, message: 'Erro ao buscar perfil' }
    }

    const profileData = {
      ...data,
      email: user.email,
      full_name: user.user_metadata?.full_name || data.full_name || 'Usuário'
    }

    // Cache the result
    if (typeof setCache === 'function') {
      setCache('user_profile', profileData)
    }

    return { success: true, data: profileData }
  } catch (error) {
    console.error('Get profile error:', error)
    return { success: false, message: 'Erro ao buscar perfil' }
  }
}

/**
 * Update user profile (name, etc.)
 * @param {Object} updates - Profile fields to update
 * @returns {Object} Result with success status
 */
async function updateProfile(updates) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: 'Usuário não autenticado' }
    }

    // Update user metadata (for full_name)
    if (updates.full_name) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: updates.full_name }
      })

      if (metadataError) {
        console.error('Update metadata error:', metadataError)
        return { success: false, message: 'Erro ao atualizar nome' }
      }
    }

    // Update profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update profile error:', updateError)
      return { success: false, message: 'Erro ao atualizar perfil' }
    }

    // Clear cache
    if (typeof clearCache === 'function') {
      clearCache('user_profile')
    }

    return { success: true, message: 'Perfil atualizado com sucesso!' }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, message: 'Erro ao atualizar perfil' }
  }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Object} Result with success status
 */
async function updatePassword(newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Update password error:', error)
      return { success: false, message: 'Erro ao alterar senha' }
    }

    return { success: true, message: 'Senha alterada com sucesso!' }
  } catch (error) {
    console.error('Update password error:', error)
    return { success: false, message: 'Erro ao alterar senha' }
  }
}
