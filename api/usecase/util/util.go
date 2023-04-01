package util

// 配列の存在チェックメソッド
func Iscontains(slice []string, str string) bool {
	for _, e := range slice {
		if e == str {
			return true
		}
	}
	return false
}
