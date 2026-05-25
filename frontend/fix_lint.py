import re

files = [
    'src/pages/auth/ForgotPassword.jsx',
    'src/pages/auth/SignIn.jsx',
    'src/pages/auth/SignUp.jsx',
    'src/pages/product/CategoryProductsPage.jsx',
    'src/pages/product/ProductDescription.jsx',
    'src/pages/product/ProductListPage.jsx',
    'src/pages/user/Profile.jsx',
    'src/redux/slices/addressSlice.js',
    'src/redux/slices/cartSlice.js',
    'src/redux/slices/categorySlice.js',
    'src/redux/slices/orderSlice.js',
    'src/redux/slices/productSlice.js',
    'src/redux/slices/searchSlice.js',
]

for file_path in files:
    full_path = f"/Users/hatim/Projects/Sportsync-Updated/Sportsync/frontend/{file_path}"
    with open(full_path, 'r') as f:
        content = f.read()

    # Fix React unused
    content = re.sub(r"import React(?:, \{[^}]+\})? from 'react';\n", lambda m: m.group(0).replace('React, ', '').replace('React', '') if 'useState' not in m.group(0) else m.group(0).replace('React, ', ''), content)
    content = re.sub(r"import React from 'react';\n", "", content)

    # Fix 'action' in slices
    if 'Slice' in file_path:
        content = re.sub(r"\(state, action\)", "(state)", content)
    
    # Fix unused in Profile
    if 'Profile.jsx' in file_path:
        content = re.sub(r"import \{ deleteUserStart, deleteUserSuccess, deleteUserFailure \} from '../../redux/slices/userSlice';\n", "", content)
        content = re.sub(r"const addressLoading = useSelector\(\(state\) => state\.address\.loading\);\n", "", content)
        content = content.replace("'", "&apos;").replace('"', "&quot;")

    with open(full_path, 'w') as f:
        f.write(content)
